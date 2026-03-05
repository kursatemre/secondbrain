/**
 * Hatırlatıcı Cron Endpoint (Özellik 8)
 * Vercel Cron: her saat çalışır, vadesi gelen hatırlatıcıları WhatsApp'tan gönderir.
 *
 * vercel.json'a ekle:
 * "crons": [{ "path": "/api/cron/reminders", "schedule": "0 * * * *" }]
 *
 * Vercel güvenlik: CRON_SECRET env değişkeni ile doğrulama yapılır.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDueReminders, markReminderSent, updateReminderTime } from '@/lib/supabase';
import { sendMessage } from '@/lib/whatsapp';
import { nextRecurrence } from '@/lib/tasks';

// Günlük max hatırlatma sayısı (Maliyet kontrolü)
const MAX_REMINDERS_PER_USER_PER_DAY = 3;
const userReminderCount: Map<string, number> = new Map();

export async function GET(req: NextRequest) {
  // Yetkilendirme
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reminders = await getDueReminders();
    const results = { sent: 0, skipped: 0, errors: 0 };

    for (const reminder of reminders) {
      const userId = reminder.user_id;

      // Günlük limit kontrolü
      const count = userReminderCount.get(userId) ?? 0;
      if (count >= MAX_REMINDERS_PER_USER_PER_DAY) {
        results.skipped++;
        continue;
      }

      try {
        // WhatsApp'tan gönder
        await sendMessage(userId, `⏰ *Hatırlatıcı:*\n\n${reminder.message}`);
        await markReminderSent(reminder.id);
        userReminderCount.set(userId, count + 1);
        results.sent++;

        // Tekrarlı hatırlatıcılar için yeni zaman hesapla
        if (reminder.is_recurring && reminder.recurrence_rule) {
          const nextTime = nextRecurrence(
            new Date(reminder.remind_at),
            reminder.recurrence_rule
          );
          if (nextTime) {
            await updateReminderTime(reminder.id, nextTime.toISOString());
          }
        }
      } catch (err) {
        console.error(`[Cron] Reminder ${reminder.id} gönderilemedi:`, err);
        results.errors++;
      }
    }

    console.log(`[Cron/Reminders] sent=${results.sent} skipped=${results.skipped} errors=${results.errors}`);
    return NextResponse.json({ ok: true, ...results });

  } catch (err) {
    console.error('[Cron/Reminders] Fatal error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
