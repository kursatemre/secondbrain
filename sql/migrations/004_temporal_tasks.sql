-- ============================================================
-- Migration 004: Zaman Zekası + Görev Yönetimi + Etiketleme
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ============================================================

-- Özellik 1: Zaman Zekası
ALTER TABLE memories ADD COLUMN IF NOT EXISTS due_date        TIMESTAMPTZ;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS time_expression TEXT;

-- Özellik 2: Görev Yönetimi
ALTER TABLE memories ADD COLUMN IF NOT EXISTS is_task       BOOLEAN DEFAULT false;
ALTER TABLE memories ADD COLUMN IF NOT EXISTS task_status   TEXT    DEFAULT 'pending'
  CHECK (task_status IN ('pending', 'done', 'cancelled'));
ALTER TABLE memories ADD COLUMN IF NOT EXISTS completed_at  TIMESTAMPTZ;

-- Özellik 3: Etiketleme
ALTER TABLE memories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_memories_due_date
  ON memories (user_id, due_date) WHERE due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memories_tasks
  ON memories (user_id, task_status, due_date) WHERE is_task = true;

CREATE INDEX IF NOT EXISTS idx_memories_tags
  ON memories USING GIN (tags);
