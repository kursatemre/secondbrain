-- ============================================================
-- Migration 005: Proaktif Zeka + Profil + Hatırlatıcı + Bağlantılar
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ============================================================

-- Özellik 4: Proaktif Zeka — kullanıcı durumu
CREATE TABLE IF NOT EXISTS user_state (
  user_id              TEXT PRIMARY KEY,  -- whatsapp_id
  last_briefing_date   DATE,
  last_weekly_report   DATE,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Özellik 5: Bağlam Hafızası — kullanıcı profili
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id                  TEXT PRIMARY KEY,  -- whatsapp_id
  profile                  JSONB DEFAULT '{}',
  last_updated             TIMESTAMPTZ DEFAULT now(),
  memory_count_at_update   INT DEFAULT 0
);

-- Özellik 8: Hatırlatıcı
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,             -- whatsapp_id
  memory_id       UUID REFERENCES memories(id) ON DELETE SET NULL,
  message         TEXT NOT NULL,
  remind_at       TIMESTAMPTZ NOT NULL,
  is_recurring    BOOLEAN DEFAULT false,
  recurrence_rule TEXT,                      -- "weekly:monday", "daily", "monthly:15"
  status          TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'sent', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending
  ON reminders (remind_at) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_reminders_user
  ON reminders (user_id, status);

-- Özellik 9: Akıllı Bağlantılar
CREATE TABLE IF NOT EXISTS memory_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id_1      UUID REFERENCES memories(id) ON DELETE CASCADE,
  memory_id_2      UUID REFERENCES memories(id) ON DELETE CASCADE,
  similarity_score FLOAT,
  connection_type  TEXT DEFAULT 'auto'
    CHECK (connection_type IN ('auto', 'manual')),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connections_1 ON memory_connections (memory_id_1);
CREATE INDEX IF NOT EXISTS idx_connections_2 ON memory_connections (memory_id_2);
