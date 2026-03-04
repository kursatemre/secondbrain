import { NextRequest } from 'next/server';
import { processMessage } from '@/lib/messageProcessor';

export const dynamic = 'force-dynamic';

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
  const body = await req.json();

  // Meta 20sn içinde 200 bekliyor — hemen cevap ver, işlemi arka planda başlat
  if (body.object !== 'whatsapp_business_account') {
    return new Response('OK', { status: 200 });
  }

  const message     = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderPhone = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;

  if (!message || !senderPhone) {
    return new Response('OK', { status: 200 });
  }

  if (!['text', 'audio'].includes(message.type)) {
    console.log(`[Webhook] Desteklenmeyen tip: ${message.type}`);
    return new Response('OK', { status: 200 });
  }

  console.log(`[Webhook] 📨 ${senderPhone} → ${message.type}`);

  // Fire-and-forget: 200 döner, işlem arka planda sürer
  processMessage(message, senderPhone).catch((err) => {
    console.error('[Webhook] processMessage hatası:', err);
  });

  return new Response('OK', { status: 200 });
}
