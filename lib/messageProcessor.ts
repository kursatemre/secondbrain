import {
  getOrCreateUser,
  saveMemory,
  searchMemories,
  searchMemoriesHybrid,
  checkUsage,
  hasAcceptedKvkk,
  recordKvkkConsent,
  requestDataDeletion,
  deleteUserData,
  saveFailedMessage,
  getUserMemories,
  // Görev
  getPendingTasks,
  getTodayTasks,
  getOverdueTasks,
  getRecentlyCompletedTasks,
  updateTaskStatus,
  getWeeklyTaskStats,
  // Proaktif
  getUserState,
  updateUserState,
  // Profil
  getUserProfile,
  updateUserProfile,
  getRecentMemoryContents,
  // Hatırlatıcı
  createReminder,
  getActiveReminders,
  // Bağlantılar
  findSimilarMemories,
  saveMemoryConnection,
  // Sayı
  getTotalMemoryCount,
} from './supabase';
import { embed, chat, analyzeImage } from './openai-client';
import { sendMessage, sendButtonMessage, downloadMedia } from './whatsapp';
import { scrapeUrl } from './firecrawl';
import { fetchSocialMeta } from './socialMedia';
import { transcribeAudio } from './groq';
import { withRetry } from './retry';
import {
  analyzeMessage,
  extractHashtags,
  getTodayStr,
  summarizeTranscript,
  matchPendingTask,
} from './analyze';
import { formatTaskList, overdueWarningLine } from './tasks';
import {
  buildMorningBriefing as buildBriefing,
  buildWeeklyReport as buildReport,
  generateUserProfile,
  formatProfileForPrompt,
} from './proactive';

// Re-export from proactive since tasks.ts exports these too
export { formatTaskList } from './tasks';

// ─── MESAJLAR ────────────────────────────────────────────────────────────────

const WELCOME_TEXT = `👋 *Second Brain'e Hoş Geldin!*

Ben senin kişisel AI hafızan. WhatsApp üzerinden her şeyi kaydeder, istediğinde bulup getiririm.

Devam etmek için önce gizlilik onayı gerekiyor 👇`;

const USAGE_GUIDE = `📖 *Second Brain — Kullanım Kılavuzu*

*📥 Kaydetmek için:*
📝 Herhangi bir metin yaz → kaydederim
🔗 Link gönder → özetleyip saklarım
🎤 Ses notu gönder → yazıya çevirip kaydederim
🖼️ Fotoğraf gönder → analiz edip saklarım
🏷️ Etiket ekle → "süt al #alışveriş #kişisel"

*🔍 Soru sormak için:*
"Pasta tarifini bul"
"O toplantı ne zamandı?"
"Hangi linki atmıştım?"

*✅ Görev yönetimi:*
"Yarın saat 15 toplantı var" → görev kaydedilir
"süt aldım" / "toplantı bitti" → tamamlandı
"görevlerim" → bekleyen görevler listesi
"bugün ne yapacağım" → bugünkü görevler
"geciken görevler" → vadesi geçmiş görevler
"tamamlananlar" → son 7 günde bitenler

*⏰ Hatırlatıcı:*
"3 gün sonra hatırlat: faturayı öde"
"Her Pazartesi hatırlat: haftalık rapor"
"15 Mart saat 14:00'te hatırlat"
"hatırlatmalarım" → aktif hatırlatıcılar

*📊 Raporlar:*
"görev raporu" → haftalık istatistik

*🔐 Veri haklarım:*
"verilerimi indir" → kayıtlarını görüntüle (KVKK)
"verilerimi sil" → tüm verilerini sil
"profilim" → Second Brain'in seni nasıl tanıdığı`;

const KVKK_TEXT = `🔒 *Gizlilik ve Veri Koruma Bildirimi*

*Veri Sorumlusu:* Second Brain · secondbrain.com.tr

*İşlenen Kişisel Veriler:*
• WhatsApp telefon numaranız
• Gönderdiğiniz metin, ses, görsel ve linkler

*Amaç:* Kişisel dijital hafıza hizmeti sunmak

*Hukuki Dayanak:* Açık rıza — KVKK Madde 5/1-a · GDPR Article 6/1-a

*Saklama Süresi:* Hesabınız aktif olduğu süre boyunca

*Veri Aktarımı:* İçerikleriniz AI işleme amacıyla OpenAI ve Groq altyapısı üzerinden şifreli olarak iletilir. Üçüncü taraflarla paylaşılmaz.

*Haklarınız (KVKK Md. 11 · GDPR Art. 17):*
• Verilerinize erişme ve düzeltme talep etme
• Tüm verilerinizin silinmesini isteme → "tüm verilerimi sil" yazın
• İşlemeye itiraz etme

Onaylamak için aşağıdaki butona basın:`;

const DELETE_CONFIRM_TEXT = `⚠️ *Veri Silme Talebi*

Tüm notların, linkler, ses ve görsel analizlerin kalıcı olarak silinecek.

Bu işlem *geri alınamaz.*`;

// ─── TIPLER ──────────────────────────────────────────────────────────────────

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
  trial_ends_at: string | null;
};

/** Trial aktifse true döner */
function isTrialActive(user: UserRecord): boolean {
  return !!user.trial_ends_at && new Date(user.trial_ends_at) > new Date();
}

/** Trial veya gerçek plana göre efektif planı döner */
function effectivePlan(user: UserRecord): UserRecord['plan'] {
  return isTrialActive(user) ? 'profesyonel' : user.plan;
}

// Plan bazlı arama konfigürasyonu
const SEARCH_CONFIG: Record<UserRecord['plan'], { limit: number; hybrid: boolean }> = {
  free:        { limit: 3,  hybrid: false },
  kisisel:     { limit: 5,  hybrid: false },
  profesyonel: { limit: 8,  hybrid: true  },
  sinirsiz:    { limit: 10, hybrid: true  },
};

// ─── ANA YÖNLENDIRICI ────────────────────────────────────────────────────────

export async function processMessage(message: WhatsAppMessage, senderPhone: string) {
  const user = await getOrCreateUser(senderPhone);

  // ─── Buton cevapları (interactive) ──────────────────────────────────────
  if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
    const buttonId = message.interactive.button_reply?.id;

    if (buttonId === 'kvkk_accept') {
      await recordKvkkConsent(user.id);

      // 1. Kullanım kılavuzu
      await sendMessage(senderPhone, USAGE_GUIDE);

      // 2. Trial bilgilendirme
      const trialEnd = user.trial_ends_at
        ? new Date(user.trial_ends_at).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })
        : null;
      const trialMsg = trialEnd
        ? `🎁 *15 Günlük Ücretsiz Deneme Başladı!*\n\n` +
          `Deneme süresince tüm *Profesyonel Plan* özellikleri açık:\n` +
          `✅ Sınırsız mesaj\n` +
          `✅ Ses notu (sınırsız)\n` +
          `✅ Görsel analiz\n` +
          `✅ Hibrit arama\n` +
          `✅ Hatırlatıcılar\n` +
          `✅ Sabah briefing\n\n` +
          `⏳ Deneme: *${trialEnd}* tarihine kadar geçerli.\n` +
          `Sonrasında ücretsiz plan (30 mesaj/toplam) devam eder.\n\n` +
          `Plan yükseltmek için: secondbrain.com.tr`
        : `✅ *Onayın alındı!* Artık Second Brain\'ini kullanabilirsin. 🧠`;

      await sendMessage(senderPhone, trialMsg);
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
      await sendMessage(senderPhone, '👍 İptal edildi, verilerin güvende.');
      return;
    }

    return;
  }

  const text = message.text?.body?.trim() ?? '';
  const textLower = text.toLowerCase();

  // ─── Veri indirme talebi (KVKK Md. 11) ─────────────────────────────────
  if (textLower.includes('verilerimi indir')) {
    await exportUserData(user, senderPhone);
    return;
  }

  // ─── Veri silme talebi ───────────────────────────────────────────────────
  if (textLower.includes('verilerimi sil')) {
    await requestDataDeletion(user.id, senderPhone);
    await sendButtonMessage(senderPhone, DELETE_CONFIRM_TEXT, [
      { id: 'delete_confirm', title: '🗑️ Evet, sil' },
      { id: 'delete_cancel',  title: '↩️ İptal' },
    ]);
    return;
  }

  // ─── Görev komutları ─────────────────────────────────────────────────────
  if (message.type === 'text') {
    const handled = await handleSpecialCommand(textLower, user, senderPhone);
    if (handled) return;
  }

  // ─── KVKK onay kontrolü ─────────────────────────────────────────────────
  const accepted = await hasAcceptedKvkk(user.id);
  if (!accepted) {
    if (user.message_count === 0) await sendMessage(senderPhone, WELCOME_TEXT);
    await sendButtonMessage(senderPhone, KVKK_TEXT, [
      { id: 'kvkk_accept', title: '✅ Kabul Ediyorum' },
    ]);
    return;
  }

  // ─── Mesaj limiti (trial aktifse bypass) ────────────────────────────────
  const trialActive = isTrialActive(user);
  const msgUsage = await checkUsage(user.id, 'message');
  if (!msgUsage.allowed && !trialActive) {
    const limitText = user.plan === 'free'
      ? `Ücretsiz planda toplam ${msgUsage.limit} mesaj hakkın var ve hepsini kullandın.`
      : `Bu ay kullanabileceğin ${msgUsage.limit} mesaj hakkını doldurdun.`;
    await sendMessage(
      senderPhone,
      `📵 ${limitText}\n\nDevam etmek için planını yükselt: secondbrain.com.tr`
    );
    return;
  }

  const threshold80 = Math.ceil(msgUsage.limit * 0.8);
  const sendQuotaWarning = !trialActive && msgUsage.count === threshold80;
  const userPlan = effectivePlan(user);

  // ─── Sabah briefing / haftalık rapor (Özellik 4) ─────────────────────────
  const briefingText = await tryGetBriefing(user, senderPhone);

  // ─── Kullanıcı profili yükleme (Özellik 5) ──────────────────────────────
  const { profile, memory_count_at_update } = await getUserProfile(senderPhone).catch(() => ({
    profile: {} as Record<string, unknown>,
    memory_count_at_update: 0,
  }));
  const profileStr = formatProfileForPrompt(profile);

  // ─── Mesaj tipleri ───────────────────────────────────────────────────────
  let msgType = detectQuickType(message);

  try {
    if (msgType === 'audio') {
      await processAudio(message, user);
    } else if (msgType === 'image') {
      await processImage(message, user, profileStr);
    } else if (msgType === 'link') {
      await processLink(message, user, profileStr);
    } else {
      // Text mesajlar için birleşik analiz
      const { tags: manualTags, cleanText } = extractHashtags(text);
      const today = getTodayStr();
      const analysis = await withRetry(
        () => analyzeMessage(cleanText || text, today, profileStr),
        2, 500
      );

      // Manuel hashtag'ler analiz tag'lerini override eder
      if (manualTags.length > 0) {
        const merged: string[] = [];
        const seen: Record<string, boolean> = {};
        for (const t of [...manualTags, ...analysis.tags]) {
          if (!seen[t]) { seen[t] = true; merged.push(t); }
        }
        analysis.tags = merged;
      }

      if (analysis.is_task_completion && analysis.task_completion_hint) {
        await handleTaskCompletion(analysis.task_completion_hint, user, senderPhone);
        return;
      }

      if (analysis.intent === 'reminder') {
        await processReminder(cleanText || text, analysis, user, senderPhone);
      } else if (analysis.intent === 'query') {
        await processQuestion(message, user, profileStr, userPlan);
      } else if (analysis.intent === 'chat') {
        await processChat(text, profileStr, senderPhone);
      } else {
        // task veya note — her ikisi de saveNote'a gider
        await processNote(cleanText || text, analysis, user);
      }
    }

    // Profil güncelleme (her 50 kayıtta bir, arka planda)
    maybeUpdateProfile(user, senderPhone, memory_count_at_update).catch(() => {});

    // %80 kota uyarısı
    if (sendQuotaWarning) {
      const remaining = msgUsage.limit - msgUsage.count;
      const periodText = user.plan === 'free' ? 'toplam' : 'bu ay';
      sendMessage(
        senderPhone,
        `⚠️ *Kota Uyarısı:* ${periodText} kullanabileceğin mesaj hakkının %80'ini doldurdun.\n\n` +
        `Kalan: *${remaining} mesaj*\n\n` +
        `Limitini artırmak için: secondbrain.com.tr`
      ).catch(() => {});
    }

    // Briefing varsa yanıttan sonra gönder
    if (briefingText) {
      sendMessage(senderPhone, briefingText).catch(() => {});
    }

  } catch (err) {
    console.error(`[Processor] Error:`, err);
    await sendMessage(senderPhone, '⚠️ Bir hata oluştu, lütfen tekrar dene.');
    const errMsg = err instanceof Error ? err.message : String(err);
    await saveFailedMessage(senderPhone, msgType, text, errMsg);
  }
}

// ─── ÖZEL KOMUTLAR ───────────────────────────────────────────────────────────

async function handleSpecialCommand(
  textLower: string,
  user: UserRecord,
  senderPhone: string
): Promise<boolean> {
  // Görev komutları
  if (textLower === 'görevlerim' || textLower === 'yapılacaklar') {
    const tasks = await getPendingTasks(user.id);
    const overdue = await getOverdueTasks(user.id);
    const overdueIds = new Set(overdue.map(t => t.id));
    const pending = tasks.filter(t => !overdueIds.has(t.id));

    let reply = '';
    if (overdue.length > 0) {
      reply += formatTaskList(overdue, '⚠️ Geciken Görevler') + '\n\n';
    }
    reply += formatTaskList(pending, '📋 Bekleyen Görevler');
    await sendMessage(senderPhone, reply.slice(0, 4000));
    return true;
  }

  if (textLower === 'bugün ne yapacağım' || textLower === 'bugünkü görevler') {
    const tasks = await getTodayTasks(user.id);
    const overdue = await getOverdueTasks(user.id);
    let reply = '';
    if (overdue.length > 0) reply += overdueWarningLine(overdue.length) + '\n';
    reply += formatTaskList(tasks, `📅 Bugünkü Görevler`);
    await sendMessage(senderPhone, reply.slice(0, 4000));
    return true;
  }

  if (textLower === 'geciken görevler') {
    const tasks = await getOverdueTasks(user.id);
    await sendMessage(senderPhone, formatTaskList(tasks, '⚠️ Geciken Görevler').slice(0, 4000));
    return true;
  }

  if (textLower === 'tamamlananlar') {
    const tasks = await getRecentlyCompletedTasks(user.id, 7);
    await sendMessage(senderPhone, formatTaskList(tasks, '✅ Son 7 Günde Tamamlananlar').slice(0, 4000));
    return true;
  }

  if (textLower === 'görev raporu') {
    const stats = await getWeeklyTaskStats(user.id);
    const totalMems = await getTotalMemoryCount(user.id);
    const report = buildReport({ ...stats, total_memories: totalMems });
    await sendMessage(senderPhone, report);
    return true;
  }

  // Hatırlatıcı komutları
  if (textLower === 'hatırlatmalarım' || textLower === 'hatırlatıcılarım') {
    const reminders = await getActiveReminders(senderPhone);
    if (reminders.length === 0) {
      await sendMessage(senderPhone, '⏰ Aktif hatırlatıcın yok.');
    } else {
      const lines = reminders.map((r, i) => {
        const dt = new Date(r.remind_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
        const rec = r.is_recurring ? ` (${r.recurrence_rule})` : '';
        return `${i + 1}. ${r.message.slice(0, 80)}${rec} · 📅 ${dt}`;
      });
      await sendMessage(senderPhone, `⏰ *Aktif Hatırlatıcılar (${reminders.length}):*\n\n${lines.join('\n')}`);
    }
    return true;
  }

  // Profil
  if (textLower === 'profilim') {
    const { profile } = await getUserProfile(senderPhone);
    if (Object.keys(profile).length === 0) {
      await sendMessage(senderPhone, '👤 Henüz profil oluşturulmadı. Birkaç not kaydet, otomatik oluşturulacak.');
    } else {
      await sendMessage(senderPhone, `👤 *Profilin:*\n\n${JSON.stringify(profile, null, 2).slice(0, 3000)}`);
    }
    return true;
  }

  if (textLower === 'profilimi sil') {
    await updateUserProfile(senderPhone, {}, 0);
    await sendMessage(senderPhone, '🗑️ Profil silindi.');
    return true;
  }

  return false;
}

// ─── GÖREV TAMAMLAMA ─────────────────────────────────────────────────────────

async function handleTaskCompletion(
  hint: string,
  user: UserRecord,
  senderPhone: string
): Promise<void> {
  const pending = await getPendingTasks(user.id);
  if (pending.length === 0) {
    // Tamamlama yorumu ama bekleyen görev yok — not olarak kaydet
    await sendMessage(senderPhone, '✅ Kaydedildi!');
    return;
  }

  const matchedId = await matchPendingTask(hint, pending.map(t => ({ id: t.id, content: t.content })));
  if (matchedId) {
    await updateTaskStatus(matchedId, 'done');
    const task = pending.find(t => t.id === matchedId);
    await sendMessage(senderPhone, `✅ *Tamamlandı:* ${task?.content.slice(0, 80) ?? ''} ✔️`);
  } else {
    await sendMessage(senderPhone, '✅ Harika! (Eşleştirilecek görev bulunamadı, not olarak kaydedilmedi.)');
  }
}

// ─── SABAH BRİEFİNG ──────────────────────────────────────────────────────────

async function tryGetBriefing(user: UserRecord, senderPhone: string): Promise<string | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const state = await getUserState(senderPhone);

    const needsBriefing = state.last_briefing_date !== today;
    const isMonday = new Date().getDay() === 1;
    const needsWeekly = isMonday && state.last_weekly_report !== today;

    if (!needsBriefing && !needsWeekly) return null;

    let text = '';

    if (needsWeekly) {
      const stats = await getWeeklyTaskStats(user.id);
      const totalMems = await getTotalMemoryCount(user.id);
      text += buildReport({ ...stats, total_memories: totalMems }) + '\n\n';
      await updateUserState(senderPhone, { last_weekly_report: today });
    }

    if (needsBriefing) {
      const [todayTasks, overdueTasks] = await Promise.all([
        getTodayTasks(user.id),
        getOverdueTasks(user.id),
      ]);
      const briefing = buildBriefing(todayTasks, overdueTasks);
      if (briefing) text += briefing;
      await updateUserState(senderPhone, { last_briefing_date: today });
    }

    return text.trim() || null;
  } catch {
    return null;
  }
}

// ─── PROFİL GÜNCELLEME (arka plan) ───────────────────────────────────────────

async function maybeUpdateProfile(
  user: UserRecord,
  senderPhone: string,
  lastUpdateCount: number
): Promise<void> {
  const total = await getTotalMemoryCount(user.id);
  if (total - lastUpdateCount < 50) return;

  const contents = await getRecentMemoryContents(user.id, 50);
  const { profile: existing } = await getUserProfile(senderPhone);
  const newProfile = await generateUserProfile(contents, existing);
  await updateUserProfile(senderPhone, newProfile, total);
}

// ─── HATIRLATICI İŞLEME ──────────────────────────────────────────────────────

async function processReminder(
  text: string,
  analysis: Awaited<ReturnType<typeof analyzeMessage>>,
  user: UserRecord,
  senderPhone: string
): Promise<void> {
  if (!analysis.remind_at) {
    // remind_at parse edilemedi — normal not olarak kaydet
    await processNote(text, analysis, user);
    return;
  }

  // Önce memory olarak kaydet
  const embedding = await withRetry(() => embed(text), 3, 1000);
  const memoryId = await saveMemory(user.id, text, embedding,
    { type: 'reminder', saved_at: new Date().toISOString() },
    {
      is_task: true,
      due_date: analysis.remind_at,
      tags: analysis.tags,
    }
  );

  // Reminder tablosuna kaydet
  await createReminder(
    senderPhone,
    text,
    analysis.remind_at,
    memoryId,
    analysis.recurrence_rule != null,
    analysis.recurrence_rule
  );

  const dt = new Date(analysis.remind_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const recStr = analysis.recurrence_rule ? ` (tekrarlı: ${analysis.recurrence_rule})` : '';
  await sendMessage(
    senderPhone,
    `⏰ *Hatırlatıcı ayarlandı!*\n\n📅 ${dt}${recStr}\n📝 ${text.slice(0, 150)}`
  );
}

// ─── NOT KAYDETME ─────────────────────────────────────────────────────────────

async function processNote(
  text: string,
  analysis: Awaited<ReturnType<typeof analyzeMessage>>,
  user: UserRecord
): Promise<void> {
  const embedding = await withRetry(() => embed(text), 3, 1000);
  const memoryId = await saveMemory(
    user.id,
    text,
    embedding,
    { type: 'note', saved_at: new Date().toISOString() },
    {
      is_task: analysis.intent === 'task',
      task_status: analysis.intent === 'task' ? 'pending' : undefined,
      due_date: analysis.due_date,
      time_expression: analysis.time_expression ?? undefined,
      tags: analysis.tags,
    }
  );

  // Akıllı bağlantı kontrolü (Özellik 9)
  findSimilarMemories(user.id, embedding, memoryId, 0.85, 3)
    .then(similar => {
      similar.forEach(s => saveMemoryConnection(memoryId, s.id, s.similarity).catch(() => {}));
      if (similar.length > 0) {
        sendMessage(
          user.whatsapp_id,
          `🔗 Bu notla ilişkili *${similar.length}* eski kaydın var. "ilişkili notlar" yazarak görebilirsin.`
        ).catch(() => {});
      }
    })
    .catch(() => {});

  if (analysis.intent === 'task') {
    const dueStr = analysis.due_date
      ? ` 📅 ${new Date(analysis.due_date).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })}`
      : '';
    const tagStr = analysis.tags.length > 0 ? ` [${analysis.tags.join(', ')}]` : '';
    await sendMessage(user.whatsapp_id, `✅ *Görev kaydedildi:* ${text.slice(0, 100)}${dueStr}${tagStr}`);
  } else {
    const tagStr = analysis.tags.length > 0 ? ` 🏷️ ${analysis.tags.join(', ')}` : '';
    await sendMessage(user.whatsapp_id, `✅ Not kaydedildi!${tagStr}`);
  }
}

// ─── LINK ─────────────────────────────────────────────────────────────────────

async function processLink(
  message: WhatsAppMessage,
  user: UserRecord,
  _profileStr: string
): Promise<void> {
  const urlUsage = await checkUsage(user.id, 'url');
  if (!urlUsage.allowed) {
    await sendMessage(
      user.whatsapp_id,
      `🔗 Bu ay kaydedebileceğin ${urlUsage.limit} link hakkını doldurdun.\n\nDaha fazla link için planını yükselt: secondbrain.com.tr`
    );
    return;
  }

  const text: string = message.text!.body;
  const url = text.match(/https?:\/\/[^\s]+/i)![0];
  const { tags: manualTags, cleanText: userContext } = extractHashtags(
    text.replace(/https?:\/\/[^\s]+/gi, '').trim()
  );

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

    if (!socialMeta?.title && !socialMeta?.author && !userContext) {
      await sendMessage(user.whatsapp_id, '💡 Instagram içerikleri otomatik okunamıyor. Linke kısa bir açıklama ekleyerek tekrar gönder.');
      return;
    }

    const enriched = await withRetry(() => chat(
      'Kullanıcı bir sosyal medya içeriği paylaştı. Hafızaya kaydedilecek zengin metin oluştur. Türkçe, 3-5 cümle.',
      `Link: ${url}\n${contextParts}`
    ), 3, 1000);

    const contentToSave = `URL: ${url}\n${contextParts}\nİçerik analizi: ${enriched}`;
    const embedding = await withRetry(() => embed(contentToSave), 3, 1000);
    await saveMemory(user.id, contentToSave, embedding,
      { type: 'link', url, platform: socialMeta?.platform, saved_at: new Date().toISOString() },
      { tags: manualTags }
    );
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
          await saveMemory(user.id, `URL: ${url}\nKullanıcı notu: ${userContext}`, embedding,
            { type: 'link', url, saved_at: new Date().toISOString() },
            { tags: manualTags }
          );
          await sendMessage(user.whatsapp_id, '✅ Notun kaydedildi!');
        } else {
          await sendMessage(user.whatsapp_id, '❌ Bu site okunamıyor. Linke kısa bir açıklama ekleyerek tekrar gönder.');
        }
        return;
      }
      throw err;
    }
    truncated = markdown.slice(0, 6000);
    summary = await withRetry(() => chat(
      'Sen bir içerik özetleyicisisin. Verilen makaleyi Türkçe olarak 3-5 cümleyle özetle. Başlık ve ana fikirler dahil olsun.',
      truncated
    ), 3, 1000);
  }

  const contentToSave = [
    `URL: ${url}`,
    userContext ? `Kullanıcı notu: ${userContext}` : '',
    `Özet: ${summary}`,
    truncated ? `Tam içerik:\n${truncated}` : '',
  ].filter(Boolean).join('\n');
  const embedding = await withRetry(() => embed(contentToSave), 3, 1000);
  await saveMemory(user.id, contentToSave, embedding,
    { type: 'link', url, saved_at: new Date().toISOString() },
    { tags: manualTags }
  );
  await sendMessage(user.whatsapp_id, `✅ Link kaydedildi!\n\n📄 *Özet:*\n${summary}`);
}

// ─── IMAGE ────────────────────────────────────────────────────────────────────

async function processImage(
  message: WhatsAppMessage,
  user: UserRecord,
  _profileStr: string
): Promise<void> {
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

// ─── AUDIO (Özellik 7: Sesli Özet) ───────────────────────────────────────────

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

async function processAudio(message: WhatsAppMessage, user: UserRecord): Promise<void> {
  const audioUsage = await checkUsage(user.id, 'audio');
  if (!audioUsage.allowed) {
    await sendMessage(
      user.whatsapp_id,
      `🎤 Bu ay ses notu limitini doldurdun (${audioUsage.limit} ses/ay).\n\nDaha fazla ses notu için planını yükselt: secondbrain.com.tr`
    );
    return;
  }
  await sendMessage(user.whatsapp_id, '🎤 Ses mesajı işleniyor...');

  const { buffer, mimeType, fileSize } = await withRetry(
    () => downloadMedia((message.audio as { id: string }).id), 3, 1000
  );

  if (fileSize > MAX_AUDIO_BYTES) {
    await sendMessage(user.whatsapp_id, `❌ Ses dosyası çok büyük (${(fileSize / 1024 / 1024).toFixed(1)} MB). Maksimum 10 MB.`);
    return;
  }

  const transcript = await withRetry(() => transcribeAudio(buffer, mimeType), 3, 1000);

  // Özellik 7: Özet embedding için kullan, raw transcript metadata'da sakla
  const summary = await withRetry(() => summarizeTranscript(transcript), 2, 500)
    .catch(() => transcript.slice(0, 300));

  const embedding = await withRetry(() => embed(summary), 3, 1000);
  await saveMemory(
    user.id,
    summary,  // arama için özet
    embedding,
    { type: 'audio', raw_transcript: transcript.slice(0, 3000), saved_at: new Date().toISOString() }
  );

  await sendMessage(
    user.whatsapp_id,
    `✅ Ses notu kaydedildi!\n\n📝 *Transkript:*\n${transcript.slice(0, 600)}${transcript.length > 600 ? '…' : ''}`
  );
}

// ─── GENEL SOHBET ─────────────────────────────────────────────────────────────

async function processChat(text: string, profileStr: string, senderPhone: string): Promise<void> {
  const today = getTodayStr();
  const profileCtx = profileStr ? `\nKullanıcı: ${profileStr}` : '';
  const systemPrompt =
    `Sen "Second Brain" kişisel AI asistanısın. Bugün: ${today}.${profileCtx}\n` +
    `Kullanıcıyla Türkçe, samimi ve kısa sohbet et. ` +
    `Saat/tarih sorularını doğrudan cevapla. Kayıt veya hafıza araması yapma.`;

  const answer = await withRetry(() => chat(systemPrompt, text), 3, 1000);
  await sendMessage(senderPhone, `🤖 ${answer}`);
}

// ─── QUESTION ─────────────────────────────────────────────────────────────────

async function processQuestion(
  message: WhatsAppMessage,
  user: UserRecord,
  profileStr: string,
  plan: UserRecord['plan'] = 'free'
): Promise<void> {
  const query: string = message.text!.body;
  const queryEmbedding = await withRetry(() => embed(query), 3, 1000);

  const { limit, hybrid } = SEARCH_CONFIG[plan] ?? SEARCH_CONFIG.free;
  const memories = hybrid
    ? await searchMemoriesHybrid(user.id, queryEmbedding, query, limit)
    : await searchMemories(user.id, queryEmbedding, limit);

  if (memories.length === 0) {
    await sendMessage(user.whatsapp_id, '🔍 Bu konuyla ilgili henüz bir şey kaydetmemişsin.');
    return;
  }

  const context = memories
    .map((m, i) => `[${i + 1}] ${m.content.slice(0, 500)}`)
    .join('\n\n---\n\n');

  const urls = memories
    .map(m => { const match = m.content.match(/URL:\s*(https?:\/\/[^\s\n]+)/); return match ? match[1] : null; })
    .filter(Boolean);

  const today = getTodayStr();
  const profileCtx = profileStr ? `\nKullanıcı: ${profileStr}` : '';
  const systemPrompt =
    `Sen "Second Brain" kişisel AI asistanısın. Bugün: ${today}.${profileCtx}\n` +
    `Kullanıcının kayıtları aşağıda. Soruyu Türkçe, kısa ve net yanıtla. ` +
    `URL varsa cevabın sonunda göster. Cevap kayıtlarda yoksa açıkça belirt.\n\n` +
    `KAYITLI HAFIZA:\n${context}`;

  const answer = await withRetry(() => chat(systemPrompt, query), 3, 1000);
  const urlSuffix = urls.length > 0 ? `\n\n🔗 *Link:*\n${(urls as string[]).join('\n')}` : '';
  await sendMessage(user.whatsapp_id, `🧠 *Second Brain:*\n\n${answer}${urlSuffix}`);
}

// ─── QUICK TYPE DETECTION (API call olmadan) ──────────────────────────────────

function detectQuickType(message: WhatsAppMessage): 'audio' | 'image' | 'link' | 'text' {
  if (message.type === 'audio') return 'audio';
  if (message.type === 'image') return 'image';
  const text = message.text?.body ?? '';
  if (/https?:\/\/[^\s]+/i.test(text)) return 'link';
  return 'text';
}

// ─── VERİ İNDİRME (KVKK Md. 11) ─────────────────────────────────────────────

const EXPORT_PREVIEW_LIMIT = 15;

async function exportUserData(user: UserRecord, senderPhone: string) {
  const memories = await getUserMemories(user.id);

  if (memories.length === 0) {
    await sendMessage(senderPhone, '📂 Henüz kayıtlı verin yok.');
    return;
  }

  const counts = memories.reduce<Record<string, number>>((acc, m) => {
    const t = (m.metadata?.type as string) ?? 'other';
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  const countLines = Object.entries(counts).map(([t, n]) => `  • ${t}: ${n}`).join('\n');

  const header =
    `📦 *Second Brain — Veri Dışa Aktarımı*\n\n` +
    `Toplam kayıt: *${memories.length}*\n${countLines}\n\n` +
    `Plan: *${user.plan}*\n\n` +
    (memories.length > EXPORT_PREVIEW_LIMIT
      ? `İlk ${EXPORT_PREVIEW_LIMIT} kayıt aşağıda. ` +
        `Tümü için destek@secondbrain.com.tr adresine yaz.\n\n`
      : '') +
    `─────────────────────`;

  await sendMessage(senderPhone, header);

  const preview = memories.slice(0, EXPORT_PREVIEW_LIMIT);
  for (let i = 0; i < preview.length; i++) {
    const mem = preview[i];
    const date = new Date(mem.created_at).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' });
    const typeLabel = (mem.metadata?.type as string) ?? 'kayıt';
    const body = mem.content.slice(0, 800) + (mem.content.length > 800 ? '…' : '');
    await sendMessage(
      senderPhone,
      `[${i + 1}/${Math.min(memories.length, EXPORT_PREVIEW_LIMIT)}] *${typeLabel}* · ${date}\n\n${body}`
    );
  }
}
