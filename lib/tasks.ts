/**
 * Görev Yönetimi — İş Mantığı Katmanı (Özellik 2)
 * DB operasyonları supabase.ts'te, format + komut mantığı burada.
 */

export interface TaskMemory {
  id: string;
  content: string;
  due_date: string | null;
  task_status: string;
  tags: string[];
  created_at: string;
  completed_at: string | null;
}

/** Görev listesini WhatsApp mesajı olarak formatlar */
export function formatTaskList(tasks: TaskMemory[], title: string): string {
  if (tasks.length === 0) return `📋 ${title}: Hiç görev yok.`;

  const lines = tasks.map((t, i) => {
    const icon = t.task_status === 'done' ? '✅' : t.task_status === 'cancelled' ? '❌' : '⬜';
    const due = t.due_date
      ? ` · 📅 ${new Date(t.due_date).toLocaleDateString('tr-TR')}`
      : '';
    const tagStr = t.tags && t.tags.length > 0 ? ` [${t.tags.join(', ')}]` : '';
    const content = t.content.slice(0, 100) + (t.content.length > 100 ? '…' : '');
    return `${i + 1}. ${icon} ${content}${due}${tagStr}`;
  });

  const MAX_CHARS = 3800;
  let body = lines.join('\n');
  if (body.length > MAX_CHARS) {
    const truncated = lines.slice(0, 20).join('\n');
    body = truncated + `\n\n_(${tasks.length - 20} görev daha var)_`;
  }

  return `📋 *${title}* (${tasks.length})\n\n${body}`;
}

/** Overdue görev sayısı için uyarı satırı */
export function overdueWarningLine(count: number): string {
  if (count === 0) return '';
  return `⚠️ ${count} gecikmiş görevin var!\n`;
}

/**
 * Haftalık rapor için görev istatistikleri formatlar
 */
export function formatWeeklyTaskStats(stats: {
  done: number;
  pending: number;
  overdue: number;
  total: number;
}): string {
  return (
    `📊 *Bu haftanın görev özeti:*\n` +
    `✅ Tamamlanan: ${stats.done}\n` +
    `⬜ Bekleyen: ${stats.pending}\n` +
    (stats.overdue > 0 ? `⚠️ Geciken: ${stats.overdue}\n` : '') +
    `📝 Toplam: ${stats.total}`
  );
}

/** Sonraki tekrarlı hatırlatma zamanını hesaplar */
export function nextRecurrence(
  from: Date,
  recurrenceRule: string
): Date | null {
  const rule = recurrenceRule.toLowerCase();
  const next = new Date(from);

  if (rule === 'daily') {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (rule.startsWith('weekly:')) {
    const dayName = rule.split(':')[1];
    const DAYS: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6,
      pazar: 0, pazartesi: 1, sali: 2, carsamba: 3,
      persembe: 4, cuma: 5, cumartesi: 6,
    };
    const targetDay = DAYS[dayName];
    if (targetDay === undefined) return null;

    next.setDate(next.getDate() + 1); // en az 1 gün ileriye
    while (next.getDay() !== targetDay) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  if (rule.startsWith('monthly:')) {
    const dayOfMonth = parseInt(rule.split(':')[1], 10);
    next.setMonth(next.getMonth() + 1);
    next.setDate(Math.min(dayOfMonth, 28)); // güvenli
    return next;
  }

  return null;
}
