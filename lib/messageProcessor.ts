import { getOrCreateUser, saveMemory, searchMemories, incrementMessageCount } from './supabase';
import { embed, chat } from './openai-client';
import { sendMessage, downloadMedia } from './whatsapp';
import { scrapeUrl } from './firecrawl';
import { transcribeAudio } from './groq';

const QUESTION_KEYWORDS = [
  'neydi', 'nedir', 'ne ', 'hangi', 'nerede', 'nasıl',
  'ne zaman', 'nezaman', 'kim', 'bul', 'hatırlat', 'söyle',
  'göster', 'listele', 'kaç', 'var mı', 'attım', 'ekledim',
  'kaydetmiştim', 'gönderdim', 'yazmıştım',
];

type MessageType = 'audio' | 'link' | 'question' | 'note';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectMessageType(message: any): MessageType {
  if (message.type === 'audio') return 'audio';

  const text: string = message.text?.body ?? '';
  if (/https?:\/\/[^\s]+/i.test(text)) return 'link';
  if (text.includes('?') || QUESTION_KEYWORDS.some((kw) => text.toLowerCase().includes(kw))) {
    return 'question';
  }
  return 'note';
}

/** Ana işlem yönlendirici — webhook'tan fire-and-forget olarak çağrılır */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processMessage(message: any, senderPhone: string) {
  const user = await getOrCreateUser(senderPhone);
  await incrementMessageCount(user.id);

  const type = detectMessageType(message);
  console.log(`[Processor] ${senderPhone} → ${type}`);

  try {
    if (type === 'link')     await processLink(message, user);
    else if (type === 'audio')    await processAudio(message, user);
    else if (type === 'question') await processQuestion(message, user);
    else                          await processNote(message, user);
  } catch (err) {
    console.error(`[Processor] Error (${type}):`, err);
    await sendMessage(senderPhone, '⚠️ Bir hata oluştu, lütfen tekrar dene.');
  }
}

// ─── LINK ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processLink(message: any, user: any) {
  const text: string = message.text.body;
  const url = text.match(/https?:\/\/[^\s]+/i)![0];

  await sendMessage(user.whatsapp_id, '🔗 Link işleniyor, biraz bekle...');

  const markdown = await scrapeUrl(url);
  const truncated = markdown.slice(0, 6000);

  const summary = await chat(
    'Sen bir içerik özetleyicisisin. Verilen makaleyi Türkçe olarak 3-5 cümleyle özetle. Başlık ve ana fikirler dahil olsun.',
    truncated
  );

  const contentToSave = `URL: ${url}\nÖzet: ${summary}\n\nTam içerik:\n${truncated}`;
  const embedding = await embed(contentToSave);
  await saveMemory(user.id, contentToSave, embedding, {
    type: 'link', url, saved_at: new Date().toISOString(),
  });

  await sendMessage(user.whatsapp_id, `✅ Link kaydedildi!\n\n📄 *Özet:*\n${summary}`);
}

// ─── AUDIO ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processAudio(message: any, user: any) {
  await sendMessage(user.whatsapp_id, '🎤 Ses mesajı işleniyor...');

  const { buffer, mimeType } = await downloadMedia(message.audio.id);
  const transcript = await transcribeAudio(buffer, mimeType);

  const embedding = await embed(transcript);
  await saveMemory(user.id, transcript, embedding, {
    type: 'audio', saved_at: new Date().toISOString(),
  });

  await sendMessage(
    user.whatsapp_id,
    `✅ Ses notu kaydedildi!\n\n📝 *Transkript:*\n${transcript}`
  );
}

// ─── QUESTION ───────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processQuestion(message: any, user: any) {
  const query: string = message.text.body;
  const queryEmbedding = await embed(query);
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

  const answer = await chat(systemPrompt, query);
  await sendMessage(user.whatsapp_id, `🧠 *Second Brain:*\n\n${answer}`);
}

// ─── NOTE ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processNote(message: any, user: any) {
  const text: string = message.text.body;
  const embedding = await embed(text);
  await saveMemory(user.id, text, embedding, {
    type: 'note', saved_at: new Date().toISOString(),
  });
  await sendMessage(user.whatsapp_id, '✅ Not kaydedildi!');
}
