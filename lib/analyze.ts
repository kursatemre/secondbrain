/**
 * Birleşik GPT Analiz Motoru
 * Tek API call ile: niyet tespiti + zaman parse + etiketleme + görev tamamlama
 */

import { chat } from './openai-client';

export interface AnalysisResult {
  intent: 'task' | 'note' | 'query' | 'reminder';
  due_date: string | null;          // ISO 8601 veya null
  time_expression: string | null;   // "yarın", "Cuma 14:00" vb.
  tags: string[];                   // ["iş", "finans"] vb.
  is_task_completion: boolean;      // "süt aldım" → true
  task_completion_hint: string | null; // hangi görevi tamamlıyor
  remind_at: string | null;         // hatırlatma zamanı ISO 8601
  recurrence_rule: string | null;   // "weekly:monday", "daily", "monthly:15"
}

const AUTO_TAG_POOL = [
  'iş', 'kişisel', 'finans', 'sağlık', 'eğitim',
  'yemek', 'seyahat', 'ilham', 'ilişkiler', 'teknik',
];

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function getTodayStr(): string {
  const now = new Date();
  return `${now.toISOString().split('T')[0]}, ${DAYS_TR[now.getDay()]}`;
}

/** Metinden #hashtag etiketlerini çıkarır ve temizlenmiş metni döner */
export function extractHashtags(text: string): { tags: string[]; cleanText: string } {
  const tags: string[] = [];
  const cleaned = text.replace(/#(\w+)/g, (_, tag) => {
    tags.push(tag.toLowerCase());
    return '';
  }).replace(/\s+/g, ' ').trim();
  return { tags, cleanText: cleaned };
}

/**
 * Birleşik mesaj analizi — tek GPT call.
 * @param text   Analiz edilecek metin (hashtags temizlenmiş olabilir)
 * @param today  "2026-03-05, Çarşamba" formatında
 * @param profile Kullanıcı profil özeti (varsa)
 */
export async function analyzeMessage(
  text: string,
  today: string,
  profile?: string
): Promise<AnalysisResult> {
  const profileCtx = profile ? `\nKullanıcı profili: ${profile}` : '';
  const tagList = AUTO_TAG_POOL.join(', ');

  const systemPrompt =
    `Sen Second Brain mesaj analiz motorusun. Bugün: ${today}.${profileCtx}\n` +
    `Mevcut etiket havuzu: ${tagList}`;

  const userPrompt =
    `Mesajı analiz et. SADECE geçerli JSON döndür, başka hiçbir şey yazma.\n\n` +
    `Mesaj: "${text}"\n\n` +
    `{\n` +
    `  "intent": "task"|"note"|"query"|"reminder",\n` +
    `  "due_date": "ISO8601"|null,\n` +
    `  "time_expression": "orijinal ifade"|null,\n` +
    `  "tags": ["etiket1"],\n` +
    `  "is_task_completion": true|false,\n` +
    `  "task_completion_hint": "tamamlanan görev açıklaması"|null,\n` +
    `  "remind_at": "ISO8601"|null,\n` +
    `  "recurrence_rule": "weekly:monday"|"daily"|"monthly:15"|null\n` +
    `}\n\n` +
    `Kurallar:\n` +
    `- intent=task: yapılacak bir iş/eylem/görev içeriyor\n` +
    `- intent=note: bilgi notu, referans, kayıt\n` +
    `- intent=query: geçmiş kayıtlara soru soruluyor\n` +
    `- intent=reminder: "hatırlat" kelimesi geçiyor\n` +
    `- is_task_completion: "bitti","aldım","yaptım","tamam","tamamladım","gittim" vb. içeriyorsa true\n` +
    `- tags: 1-3 etiket, havuzdan seç. Kullanıcı belirtmişse onu kullan.\n` +
    `- due_date: zaman ifadesi varsa ISO 8601 döndür (bugün saati varsa ekle, yoksa T09:00:00Z kullan)\n` +
    `- remind_at: sadece intent=reminder için, yoksa null`;

  try {
    const raw = await chat(systemPrompt, userPrompt);
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return {
      intent:               parsed.intent               ?? 'note',
      due_date:             parsed.due_date             ?? null,
      time_expression:      parsed.time_expression      ?? null,
      tags:                 Array.isArray(parsed.tags)  ? parsed.tags : [],
      is_task_completion:   parsed.is_task_completion   ?? false,
      task_completion_hint: parsed.task_completion_hint ?? null,
      remind_at:            parsed.remind_at            ?? null,
      recurrence_rule:      parsed.recurrence_rule      ?? null,
    };
  } catch {
    // JSON parse hatasında güvenli varsayılan
    return {
      intent: 'note',
      due_date: null,
      time_expression: null,
      tags: [],
      is_task_completion: false,
      task_completion_hint: null,
      remind_at: null,
      recurrence_rule: null,
    };
  }
}

/** Ses transkripsiyonunu kısa özete dönüştürür (Özellik 7) */
export async function summarizeTranscript(transcript: string): Promise<string> {
  const result = await chat(
    'Sen bir transkripsiyon özetleyicisisin. Türkçe, 2-3 cümle ile özetle. Görev veya tarih varsa belirt.',
    transcript.slice(0, 4000)
  );
  return result.trim() || transcript.slice(0, 300);
}

/**
 * Bekleyen görevler arasında tamamlama eşleştirmesi yapar (fuzzy match).
 * @param hint  Kullanıcının yazdığı tamamlama metni
 * @param tasks [{ id, content }] formatında pending görevler
 * @returns Eşleşen görevin id'si veya null
 */
export async function matchPendingTask(
  hint: string,
  tasks: Array<{ id: string; content: string }>
): Promise<string | null> {
  if (tasks.length === 0) return null;

  const list = tasks.map((t, i) => `[${i}] ${t.content.slice(0, 120)}`).join('\n');
  const result = await chat(
    'Sen bir görev eşleştirme motorusun. Kullanıcının tamamladığını belirttiği görevi listeden bul.',
    `Kullanıcı mesajı: "${hint}"\n\nBekleyen görevler:\n${list}\n\n` +
    `En uygun görevin index numarasını döndür (0, 1, 2...). Hiçbiri uymuyorsa -1 döndür. SADECE SAYI.`
  );

  const idx = parseInt(result.trim(), 10);
  if (!isNaN(idx) && idx >= 0 && idx < tasks.length) return tasks[idx].id;
  return null;
}
