/**
 * Proaktif Zeka (Özellik 4) + Bağlam Hafızası (Özellik 5)
 * Sabah briefing, haftalık rapor, kullanıcı profili
 */

import { chat } from './openai-client';
import { formatWeeklyTaskStats, overdueWarningLine } from './tasks';
import type { TaskMemory } from './tasks';

/** Sabah briefing metni oluşturur (Özellik 4) */
export function buildMorningBriefing(
  todayTasks: TaskMemory[],
  overdueTasks: TaskMemory[]
): string | null {
  if (todayTasks.length === 0 && overdueTasks.length === 0) return null;

  const lines: string[] = ['🌅 *Günaydın! Bugünün özeti:*'];

  if (todayTasks.length > 0) {
    const items = todayTasks.slice(0, 5).map(t => `• ${t.content.slice(0, 80)}`);
    lines.push(`\n📅 *Bugünkü görevler (${todayTasks.length}):*`);
    lines.push(...items);
    if (todayTasks.length > 5) lines.push(`  ...ve ${todayTasks.length - 5} tane daha`);
  }

  if (overdueTasks.length > 0) {
    lines.push(`\n${overdueWarningLine(overdueTasks.length).trim()}`);
    const items = overdueTasks.slice(0, 3).map(t => `• ${t.content.slice(0, 80)}`);
    lines.push(...items);
  }

  lines.push('\n───────────────────');
  return lines.join('\n');
}

/** Haftalık rapor metni oluşturur (Özellik 4) */
export function buildWeeklyReport(stats: {
  done: number;
  pending: number;
  overdue: number;
  total_memories: number;
  top_tags: Array<{ tag: string; count: number }>;
}): string {
  const tagLine = stats.top_tags.length > 0
    ? `\n🏷️ En aktif kategori: ${stats.top_tags[0].tag}`
    : '';

  return (
    `📊 *Haftalık Second Brain Raporu*\n\n` +
    formatWeeklyTaskStats({
      done: stats.done,
      pending: stats.pending,
      overdue: stats.overdue,
      total: stats.done + stats.pending + stats.overdue,
    }) +
    tagLine +
    `\n📦 Toplam hafıza: ${stats.total_memories} kayıt\n\n` +
    `İyi haftalar! 🧠`
  );
}

/**
 * Kullanıcı profilini son 50 kayıttan çıkarır (Özellik 5)
 * GPT-4o-mini kullanır.
 */
export async function generateUserProfile(
  recentContents: string[],
  existingProfile: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (recentContents.length === 0) return existingProfile;

  const sample = recentContents.slice(0, 50).join('\n---\n').slice(0, 6000);
  const existingStr = Object.keys(existingProfile).length > 0
    ? `\nMevcut profil: ${JSON.stringify(existingProfile)}`
    : '';

  const raw = await chat(
    `Sen bir kullanıcı profil analiz motorusun. Türkçe notlardan profil çıkar.${existingStr}`,
    `Aşağıdaki notları analiz et ve JSON profil döndür. SADECE JSON.\n\n` +
    `Şema: {"occupation":"meslek","location":"şehir","interests":["ilgi1"],"preferences":["tercih1"],"family":{}}\n\n` +
    `Notlar:\n${sample}`
  );

  try {
    const jsonStr = raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    return existingProfile;
  }
}

/** Profil özetini GPT system prompt için kısa metin olarak formatlar */
export function formatProfileForPrompt(profile: Record<string, unknown>): string {
  const parts: string[] = [];
  if (profile.occupation) parts.push(String(profile.occupation));
  if (profile.location) parts.push(String(profile.location));
  if (Array.isArray(profile.preferences) && profile.preferences.length > 0) {
    parts.push(profile.preferences.slice(0, 3).join(', '));
  }
  return parts.length > 0 ? parts.join(' · ') : '';
}
