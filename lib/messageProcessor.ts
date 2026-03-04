import {
  getOrCreateUser,
  saveMemory,
  searchMemories,
  incrementMessageCount,
  hasAcceptedKvkk,
  recordKvkkConsent,
} from './supabase';
import { embed, chat } from './openai-client';
import { sendMessage, downloadMedia } from './whatsapp';
import { scrapeUrl } from './firecrawl';
import { transcribeAudio } from './groq';
import { withRetry } from './retry';


const KVKK_TEXT = `🔒 *Kişisel Verilerin Korunması Hakkında Bilgilendirme*

Second Brain, sana daha iyi hizmet sunabilmek için WhatsApp mesajlarını (metin, ses, link) işler ve şifreli olarak saklar.

• Veriler yalnızca senin sorularına cevap vermek için kullanılır
• Üçüncü taraflarla paylaşılmaz
• İstediğin zaman silinmesini talep edebilirsin (KVKK Madde 11)

Devam etmek için *KABUL EDİYORUM* yaz.`;

type MessageType = 'audio' | 'link' | 'question' | 'note';

export type WhatsAppMessage = {
  type: string;
  text?: { body: string };
  audio?: { id: string };
  [key: string]: unknown;
};

type UserRecord = {
  id: string;
  whatsapp_id: string;
  plan: 'free' | 'premium';
  message_count: number;
};

async function detectMessageType(message: WhatsAppMessage): Promise<MessageType> {
  if (message.type === 'audio') return 'audio';

  const text: string = message.text?.body ?? '';
  if (/https?:\/\/[^\s]+/i.test(text)) return 'link';

  // GPT ile intent sınıflandırma
  const result = await chat(
    `Sen bir mesaj sınıflandırıcısın. Kullanıcının mesajının amacını belirle.
Sadece tek kelime döndür: "question" veya "note"

"question": Kullanıcı daha önce kaydettiği bir bilgiyi sorguluyor, hatırlatmanı istiyor veya sana bir şey soruyor.
"note": Kullanıcı yeni bir bilgi, not, fikir veya hatırlatıcı kaydediyor.

Mesaj: ${text}`,
    ''
  );

  const intent = result.trim().toLowerCase();
  return intent === 'question' ? 'question' : 'note';
}

/** Ana işlem yönlendirici — webhook'tan fire-and-forget olarak çağrılır */
export async function processMessage(message: WhatsAppMessage, senderPhone: string) {
  const user = await getOrCreateUser(senderPhone);

  // ─── KVKK onay kontrolü ─────────────────────────────────────────────────
  const text = message.text?.body?.trim() ?? '';

  if (text.toUpperCase() === 'KABUL EDİYORUM') {
    await recordKvkkConsent(user.id);
    await sendMessage(senderPhone, '✅ Onayın alındı! Artık Second Brain\'i kullanabilirsin. Bir not, link veya ses mesajı gönder.');
    return;
  }

  const accepted = await hasAcceptedKvkk(user.id);
  if (!accepted) {
    await sendMessage(senderPhone, KVKK_TEXT);
    return;
  }
  // ────────────────────────────────────────────────────────────────────────

  await incrementMessageCount(user.id);

  const type = await detectMessageType(message);
  console.log(`[Processor] ${senderPhone} → ${type}`);

  try {
    if (type === 'link')          await processLink(message, user);
    else if (type === 'audio')    await processAudio(message, user);
    else if (type === 'question') await processQuestion(message, user);
    else                          await processNote(message, user);
  } catch (err) {
    console.error(`[Processor] Error (${type}):`, err);
    await sendMessage(senderPhone, '⚠️ Bir hata oluştu, lütfen tekrar dene.');
  }
}

// ─── LINK ───────────────────────────────────────────────────────────────────
async function processLink(message: WhatsAppMessage, user: UserRecord) {
  const text: string = message.text!.body;
  const url = text.match(/https?:\/\/[^\s]+/i)![0];

  const userContext = text.replace(/https?:\/\/[^\s]+/gi, '').trim();
  const isLocationLink = /maps\.google|goo\.gl\/maps|maps\.app\.goo|yandex.*maps|waze\.com/i.test(url);

  let summary = '';
  let truncated = '';

  if (isLocationLink) {
    // Konum linkleri scraping'e uygun değil — kullanıcı notunu kaydet
    summary = userContext || 'Konum kaydedildi.';
  } else {
    await sendMessage(user.whatsapp_id, '🔗 Link işleniyor, biraz bekle...');

    let markdown: string;
    try {
      markdown = await withRetry(() => scrapeUrl(url), 2, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('403') || msg.includes('do not support this site')) {
        if (userContext) {
          // Kullanıcının açıklamasını GPT ile zenginleştir
          const enriched = await withRetry(
            () => chat(
              `Kullanıcı bir sosyal medya linki (Instagram/TikTok vb.) paylaştı ve kısa bir açıklama yazdı.
Bu açıklamayı analiz ederek hafızaya kaydedilecek zengin bir metin oluştur.
İçeriğin ne hakkında olduğunu, kategorisini, anahtar kelimeleri ve önemli detayları çıkar.
Türkçe yaz, 3-5 cümle.`,
              `Link: ${url}\nKullanıcı notu: ${userContext}`
            ),
            3, 1000
          );
          const contentToSave = `URL: ${url}\nKullanıcı notu: ${userContext}\nİçerik analizi: ${enriched}`;
          const embedding = await withRetry(() => embed(contentToSave), 3, 1000);
          await saveMemory(user.id, contentToSave, embedding, {
            type: 'link', url, saved_at: new Date().toISOString(),
          });
          await sendMessage(user.whatsapp_id, `✅ Kaydedildi!\n\n🧠 *Analiz:*\n${enriched}`);
        } else {
          await sendMessage(user.whatsapp_id, '💡 Bu site (Instagram, TikTok vb.) otomatik okunamıyor. Linke ek olarak kısa bir açıklama yaz — örn: "et yemeği tarifi" veya "bu ürünü al". Öyle kaydederim.');
        }
        return;
      }
      throw err;
    }
    truncated = markdown.slice(0, 6000);
    summary = await withRetry(
      () => chat(
        'Sen bir içerik özetleyicisisin. Verilen makaleyi Türkçe olarak 3-5 cümleyle özetle. Başlık ve ana fikirler dahil olsun.',
        truncated
      ),
      3, 1000
    );
  }

  const contentToSave = [
    `URL: ${url}`,
    userContext ? `Kullanıcı notu: ${userContext}` : '',
    `Özet: ${summary}`,
    truncated ? `Tam içerik:\n${truncated}` : '',
  ].filter(Boolean).join('\n');
  const embedding = await withRetry(() => embed(contentToSave), 3, 1000);
  await saveMemory(user.id, contentToSave, embedding, {
    type: 'link', url, saved_at: new Date().toISOString(),
  });

  await sendMessage(user.whatsapp_id, `✅ Link kaydedildi!\n\n📄 *Özet:*\n${summary}`);
}

// ─── AUDIO ──────────────────────────────────────────────────────────────────
async function processAudio(message: WhatsAppMessage, user: UserRecord) {
  await sendMessage(user.whatsapp_id, '🎤 Ses mesajı işleniyor...');

  const { buffer, mimeType } = await withRetry(() => downloadMedia((message.audio as { id: string }).id), 3, 1000);
  const transcript = await withRetry(() => transcribeAudio(buffer, mimeType), 3, 1000);

  const embedding = await withRetry(() => embed(transcript), 3, 1000);
  await saveMemory(user.id, transcript, embedding, {
    type: 'audio', saved_at: new Date().toISOString(),
  });

  await sendMessage(
    user.whatsapp_id,
    `✅ Ses notu kaydedildi!\n\n📝 *Transkript:*\n${transcript}`
  );
}

// ─── QUESTION ───────────────────────────────────────────────────────────────
async function processQuestion(message: WhatsAppMessage, user: UserRecord) {
  const query: string = message.text!.body;
  const queryEmbedding = await withRetry(() => embed(query), 3, 1000);
  const memories = await searchMemories(user.id, queryEmbedding, 5);

  if (memories.length === 0) {
    await sendMessage(user.whatsapp_id, '🔍 Bu konuyla ilgili henüz bir şey kaydetmemişsin.');
    return;
  }

  const context = memories
    .map((m, i) => `[${i + 1}] ${m.content.slice(0, 500)}`)
    .join('\n\n---\n\n');

  const systemPrompt = `Sen "Second Brain" adında kişisel bir AI asistanısın. \
Kullanıcının daha önce kaydettiği notlar, linkler ve ses mesajları aşağıda verilmiştir. \
Bu bağlamı kullanarak soruyu Türkçe, kısa ve net şekilde yanıtla. \
Cevap bağlamda yoksa bunu açıkça belirt.

KAYITLI HAFIZA:
${context}`;

  const answer = await withRetry(() => chat(systemPrompt, query), 3, 1000);
  await sendMessage(user.whatsapp_id, `🧠 *Second Brain:*\n\n${answer}`);
}

// ─── NOTE ───────────────────────────────────────────────────────────────────
async function processNote(message: WhatsAppMessage, user: UserRecord) {
  const text: string = message.text!.body;
  const embedding = await withRetry(() => embed(text), 3, 1000);
  await saveMemory(user.id, text, embedding, {
    type: 'note', saved_at: new Date().toISOString(),
  });
  await sendMessage(user.whatsapp_id, '✅ Not kaydedildi!');
}
