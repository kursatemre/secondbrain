import {
  getOrCreateUser,
  saveMemory,
  searchMemories,
  checkUsage,
  hasAcceptedKvkk,
  recordKvkkConsent,
  requestDataDeletion,
  deleteUserData,
  saveFailedMessage,
} from './supabase';
import { embed, chat, analyzeImage } from './openai-client';
import { sendMessage, sendButtonMessage, downloadMedia } from './whatsapp';
import { scrapeUrl } from './firecrawl';
import { fetchSocialMeta } from './socialMedia';
import { transcribeAudio } from './groq';
import { withRetry } from './retry';

// ─── MESAJLAR ────────────────────────────────────────────────────────────────

const WELCOME_TEXT = `👋 *Second Brain'e Hoş Geldin!*

Ben senin kişisel AI hafızan. WhatsApp üzerinden her şeyi kaydeder, istediğinde bulup getiririm.

*Ne yapabilirsin?*

📝 *Not* — "Yarın saat 15 toplantı var"
🔗 *Link* — URL at, özetleyip saklarım
🎤 *Ses notu* — Sesli mesaj gönder, yazıya çevirip kaklarım
🖼️ *Görsel* — Fotoğraf at, analiz edip saklarım

*Sonra istediğini sor:*
"O toplantı ne zamandı?" · "Pasta tarifini bul" · "Hangi linki atmıştım?"

Devam etmek için önce gizlilik onayı gerekiyor 👇`;

const KVKK_TEXT = `🔒 *Gizlilik ve Veri Koruma Bildirimi*

*Veri Sorumlusu:* Second Brain · secondbrain.com.tr

*İşlenen Kişisel Veriler:*
• WhatsApp telefon numaranız
• Gönderdiğiniz metin, ses, görsel ve linkler

*Amaç:* Kişisel dijital hafıza hizmeti sunmak

*Hukuki Dayanak:* Açık rıza — KVKK Madde 5/1-a · GDPR Article 6/1-a

*Saklama Süresi:* Hesabınız aktif olduğu süre boyunca

*Veri Aktarımı:* İçerikleriniz AI işleme amacıyla OpenAI ve Groq altyapısı üzerinden şifreli olarak iletilir. Üçüncü taraflarla paylaşılmaz, reklam amacıyla kullanılmaz.

*Haklarınız (KVKK Md. 11 · GDPR Art. 17):*
• Verilerinize erişme ve düzeltme talep etme
• Tüm verilerinizin silinmesini isteme → "tüm verilerimi sil" yazın
• İşlemeye itiraz etme

Onaylamak için aşağıdaki butona basın:`;

const DELETE_CONFIRM_TEXT = `⚠️ *Veri Silme Talebi*

Tüm notların, linkler, ses ve görsel analizlerin kalıcı olarak silinecek.

Bu işlem *geri alınamaz.*`;

// ─── TIPLER ──────────────────────────────────────────────────────────────────

type MessageType = 'audio' | 'image' | 'link' | 'question' | 'note';

export type WhatsAppMessage = {
  type: string;
  text?: { body: string };
  audio?: { id: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
  };
  [key: string]: unknown;
};

type UserRecord = {
  id: string;
  whatsapp_id: string;
  plan: 'free' | 'kisisel' | 'profesyonel' | 'sinirsiz';
  message_count: number;
};

// ─── INTENT DETECTION ────────────────────────────────────────────────────────

async function detectMessageType(message: WhatsAppMessage): Promise<MessageType> {
  if (message.type === 'audio') return 'audio';
  if (message.type === 'image') return 'image';

  const text: string = message.text?.body ?? '';
  if (/https?:\/\/[^\s]+/i.test(text)) return 'link';

  const result = await chat(
    `Sen bir mesaj sınıflandırıcısın. Kullanıcının mesajının amacını belirle.
Sadece tek kelime döndür: "question" veya "note"

"question": Şunlardan biri geçerliyse:
- Daha önce kaydedilmiş bir bilgiyi sorguluyor ("neydi", "nerede", "ne zaman", "hatırlat" vb.)
- Geçmişte gönderdiği bir şeyi arıyor ("atmıştım", "gönderdim", "kaydetmiştim", "ekledim" vb.)
- Hafızadan bir bilgi getirmesini istiyor ("hangi link", "o tarif", "o yer" vb.)
- Örtük soru: sana daha önce bir şey gönderdiğini ima ediyor

"note": Kullanıcı YENİ bir bilgi, not, fikir, plan veya hatırlatıcı kaydediyor. Geçmişe atıf yok.

Örnekler:
- "Bi Instagram linki atmıştım sana" → question
- "Patlıcan musakka tarifi neydi" → question
- "Cumartesi saat 15 toplantı var" → note
- "O et yemeği tarifinin linkini bul" → question
- "Yarın doktora gidiyorum" → note

Mesaj: ${text}`,
    ''
  );

  const intent = result.trim().toLowerCase();
  return intent === 'question' ? 'question' : 'note';
}

// ─── ANA YÖNLENDIRICI ────────────────────────────────────────────────────────

/** Ana işlem yönlendirici — webhook'tan fire-and-forget olarak çağrılır */
export async function processMessage(message: WhatsAppMessage, senderPhone: string) {
  const user = await getOrCreateUser(senderPhone);

  // ─── Buton cevapları (interactive) ──────────────────────────────────────
  if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
    const buttonId = message.interactive.button_reply?.id;

    if (buttonId === 'kvkk_accept') {
      await recordKvkkConsent(user.id);
      await sendMessage(
        senderPhone,
        '✅ *Onayın alındı!*\n\nArtık Second Brain\'ini kullanabilirsin.\n\nBir not, link, ses mesajı veya görsel gönder — hepsini kaydeder, istediğinde bulup getiririm 🧠'
      );
      return;
    }

    if (buttonId === 'delete_confirm') {
      await deleteUserData(user.id);
      await sendMessage(
        senderPhone,
        '✅ Tüm verilerin silindi.\n\nSecond Brain\'i tekrar kullanmak istersen yeni bir mesaj gönder, yeniden başlarsın.'
      );
      return;
    }

    if (buttonId === 'delete_cancel') {
      await sendMessage(senderPhone, '👍 İptal edildi, verilerın güvende.');
      return;
    }

    return;
  }

  const text = message.text?.body?.trim() ?? '';

  // ─── Veri silme talebi ───────────────────────────────────────────────────
  const textLower = text.toLowerCase();
  if (textLower.includes('verilerimi sil')) {
    await requestDataDeletion(user.id, senderPhone);
    await sendButtonMessage(senderPhone, DELETE_CONFIRM_TEXT, [
      { id: 'delete_confirm', title: '🗑️ Evet, sil' },
      { id: 'delete_cancel',  title: '↩️ İptal' },
    ]);
    return;
  }

  // ─── KVKK onay kontrolü ─────────────────────────────────────────────────
  const accepted = await hasAcceptedKvkk(user.id);
  if (!accepted) {
    // İlk kez geliyorsa karşılama mesajını da gönder
    if (user.message_count === 0) {
      await sendMessage(senderPhone, WELCOME_TEXT);
    }
    await sendButtonMessage(senderPhone, KVKK_TEXT, [
      { id: 'kvkk_accept', title: '✅ Kabul Ediyorum' },
    ]);
    return;
  }
  // ────────────────────────────────────────────────────────────────────────

  // ─── Aylık mesaj limiti ──────────────────────────────────────────────────
  const msgUsage = await checkUsage(user.id, 'message');
  if (!msgUsage.allowed) {
    const limitText = user.plan === 'free'
      ? `Ücretsiz planda toplam ${msgUsage.limit} mesaj hakkın var ve hepsini kullandın.`
      : `Bu ay kullanabileceğin ${msgUsage.limit} mesaj hakkını doldurdun.`;
    await sendMessage(
      senderPhone,
      `📵 ${limitText}\n\nDevam etmek için planını yükselt: secondbrain.com.tr`
    );
    return;
  }
  // ────────────────────────────────────────────────────────────────────────

  const type = await detectMessageType(message);
  console.log(`[Processor] ${senderPhone} → ${type}`);

  try {
    if (type === 'link')          await processLink(message, user);
    else if (type === 'audio')    await processAudio(message, user);
    else if (type === 'image')    await processImage(message, user);
    else if (type === 'question') await processQuestion(message, user);
    else                          await processNote(message, user);
  } catch (err) {
    console.error(`[Processor] Error (${type}):`, err);
    await sendMessage(senderPhone, '⚠️ Bir hata oluştu, lütfen tekrar dene.');
    const errMsg = err instanceof Error ? err.message : String(err);
    await saveFailedMessage(senderPhone, type, message.text?.body ?? '', errMsg);
  }
}

// ─── LINK ───────────────────────────────────────────────────────────────────
async function processLink(message: WhatsAppMessage, user: UserRecord) {
  const urlUsage = await checkUsage(user.id, 'url');
  if (!urlUsage.allowed) {
    await sendMessage(
      user.whatsapp_id,
      `🔗 Bu ay kaydedebileceğin ${urlUsage.limit} link hakkını doldurdun.\n\nDaha fazla link kaydetmek için planını yükselt: secondbrain.com.tr`
    );
    return;
  }

  const text: string = message.text!.body;
  const url = text.match(/https?:\/\/[^\s]+/i)![0];

  const userContext = text.replace(/https?:\/\/[^\s]+/gi, '').trim();
  const isLocationLink = /maps\.google|goo\.gl\/maps|maps\.app\.goo|yandex.*maps|waze\.com/i.test(url);
  const isSocialMedia = /instagram\.com|tiktok\.com/i.test(url);

  if (isSocialMedia) {
    const socialMeta = await fetchSocialMeta(url);
    const contextParts = [
      socialMeta ? `Platform: ${socialMeta.platform}` : (/instagram\.com/i.test(url) ? 'Platform: Instagram' : 'Platform: TikTok'),
      socialMeta?.author ? `Hesap: ${socialMeta.author}` : '',
      socialMeta?.title ? `Başlık/Caption: ${socialMeta.title}` : '',
      userContext ? `Kullanıcı notu: ${userContext}` : '',
    ].filter(Boolean).join('\n');

    const hasContent = socialMeta?.title || socialMeta?.author || userContext;
    if (!hasContent) {
      await sendMessage(user.whatsapp_id, '💡 Instagram içerikleri otomatik okunamıyor. Linke kısa bir açıklama ekleyerek tekrar gönder — örn:\n"[link] et yemeği tarifi"\n"[link] bu ürünü al"');
      return;
    }

    const enriched = await withRetry(
      () => chat(
        `Kullanıcı bir sosyal medya içeriği paylaştı. Aşağıdaki bilgileri analiz et ve hafızaya kaydedilecek zengin bir metin oluştur.
İçeriğin ne hakkında olduğunu, kategorisini ve anahtar kelimeleri çıkar. Türkçe yaz, 3-5 cümle.`,
        `Link: ${url}\n${contextParts}`
      ),
      3, 1000
    );

    const contentToSave = `URL: ${url}\n${contextParts}\nİçerik analizi: ${enriched}`;
    const embedding = await withRetry(() => embed(contentToSave), 3, 1000);
    await saveMemory(user.id, contentToSave, embedding, {
      type: 'link', url, platform: socialMeta?.platform, saved_at: new Date().toISOString(),
    });
    await sendMessage(user.whatsapp_id, `✅ Kaydedildi!\n\n🧠 *Analiz:*\n${enriched}`);
    return;
  }

  let summary = '';
  let truncated = '';

  if (isLocationLink) {
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
          const embedding = await withRetry(() => embed(`URL: ${url}\n${userContext}`), 3, 1000);
          await saveMemory(user.id, `URL: ${url}\nKullanıcı notu: ${userContext}`, embedding, {
            type: 'link', url, saved_at: new Date().toISOString(),
          });
          await sendMessage(user.whatsapp_id, '✅ Notun kaydedildi!');
        } else {
          await sendMessage(user.whatsapp_id, '❌ Bu site okunamıyor. Linke kısa bir açıklama ekleyerek tekrar gönder.');
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

// ─── IMAGE ──────────────────────────────────────────────────────────────────
async function processImage(message: WhatsAppMessage, user: UserRecord) {
  await sendMessage(user.whatsapp_id, '🖼️ Görsel analiz ediliyor...');

  const imageId = (message.image as { id: string } | undefined)?.id;
  const caption = (message.image as { caption?: string } | undefined)?.caption ?? '';

  if (!imageId) {
    await sendMessage(user.whatsapp_id, '⚠️ Görsel alınamadı, tekrar dene.');
    return;
  }

  const { buffer, mimeType } = await withRetry(() => downloadMedia(imageId), 3, 1000);
  const analysis = await withRetry(() => analyzeImage(buffer, mimeType, caption || undefined), 3, 1000);

  const contentToSave = [
    caption ? `Kullanıcı notu: ${caption}` : '',
    `Görsel analizi: ${analysis}`,
  ].filter(Boolean).join('\n');

  const embedding = await withRetry(() => embed(contentToSave), 3, 1000);
  await saveMemory(user.id, contentToSave, embedding, {
    type: 'image', saved_at: new Date().toISOString(),
  });

  await sendMessage(user.whatsapp_id, `✅ Görsel kaydedildi!\n\n🧠 *Analiz:*\n${analysis}`);
}

// ─── AUDIO ──────────────────────────────────────────────────────────────────
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB

async function processAudio(message: WhatsAppMessage, user: UserRecord) {
  const audioUsage = await checkUsage(user.id, 'audio');
  if (!audioUsage.allowed) {
    await sendMessage(
      user.whatsapp_id,
      `🎤 Bu ay ses notu limitini doldurdun (${audioUsage.limit} ses/ay).\n\nDaha fazla ses notu için planını yükselt: secondbrain.com.tr`
    );
    return;
  }
  await sendMessage(user.whatsapp_id, '🎤 Ses mesajı işleniyor...');

  const { buffer, mimeType, fileSize } = await withRetry(() => downloadMedia((message.audio as { id: string }).id), 3, 1000);

  if (fileSize > MAX_AUDIO_BYTES) {
    await sendMessage(user.whatsapp_id, `❌ Ses dosyası çok büyük (${(fileSize / 1024 / 1024).toFixed(1)} MB). Maksimum boyut 10 MB.`);
    return;
  }

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

  const urls = memories
    .map(m => {
      const match = m.content.match(/URL:\s*(https?:\/\/[^\s\n]+)/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  const systemPrompt = `Sen "Second Brain" adında kişisel bir AI asistanısın. \
Kullanıcının daha önce kaydettiği notlar, linkler ve ses mesajları aşağıda verilmiştir. \
Bu bağlamı kullanarak soruyu Türkçe, kısa ve net şekilde yanıtla. \
Kayıtta URL varsa cevabın sonunda mutlaka göster. \
Cevap bağlamda yoksa bunu açıkça belirt.

KAYITLI HAFIZA:
${context}`;

  const answer = await withRetry(() => chat(systemPrompt, query), 3, 1000);
  const urlSuffix = urls.length > 0 ? `\n\n🔗 *Link:*\n${urls.join('\n')}` : '';
  await sendMessage(user.whatsapp_id, `🧠 *Second Brain:*\n\n${answer}${urlSuffix}`);
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
