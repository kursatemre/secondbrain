import { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { waitUntil } from '@vercel/functions';
import { processMessage } from '@/lib/messageProcessor';
import { checkRateLimit, RateLimitError } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/** X-Hub-Signature-256 doğrulaması */
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.META_APP_SECRET) return false;
  const expected = 'sha256=' + createHmac('sha256', process.env.META_APP_SECRET)
    .update(rawBody)
    .digest('hex');
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Meta webhook doğrulaması (GET) */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('[Webhook] ✅ Doğrulama başarılı');
    return new Response(challenge, { status: 200 });
  }

  console.warn('[Webhook] ❌ Doğrulama başarısız');
  return new Response('Forbidden', { status: 403 });
}

/** Gelen WhatsApp mesajları (POST) */
export async function POST(req: NextRequest) {
  const rawBody  = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (!verifySignature(rawBody, signature)) {
    console.warn('[Webhook] ❌ İmza doğrulaması başarısız');
    return new Response('Forbidden', { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Meta 20sn içinde 200 bekliyor — hemen cevap ver, işlemi arka planda başlat
  if (body.object !== 'whatsapp_business_account') {
    return new Response('OK', { status: 200 });
  }

  const entry   = (body.entry as Record<string, unknown>[])?.[0];
  const change  = (entry?.changes as Record<string, unknown>[])?.[0];
  const value   = change?.value as Record<string, unknown> | undefined;
  const messages = value?.messages as Record<string, unknown>[] | undefined;
  const message     = messages?.[0];
  const senderPhone = message?.from as string | undefined;

  if (!message || !senderPhone) {
    return new Response('OK', { status: 200 });
  }

  if (!['text', 'audio'].includes(message.type as string)) {
    console.log(`[Webhook] Desteklenmeyen tip: ${message.type}`);
    return new Response('OK', { status: 200 });
  }

  console.log(`[Webhook] 📨 ${senderPhone} → ${message.type}`);

  // waitUntil: 200 döner ama Vercel fonksiyonu işlem bitene kadar yaşar
  waitUntil(
    (async () => {
      try {
        await checkRateLimit(senderPhone);
        await processMessage(message, senderPhone);
      } catch (err) {
        if (err instanceof RateLimitError) {
          console.warn(`[Webhook] Rate limit: ${senderPhone} — ${err.message}`);
        } else {
          console.error('[Webhook] processMessage hatası:', err);
        }
      }
    })()
  );

  return new Response('OK', { status: 200 });
}
