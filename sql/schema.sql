-- ============================================================
-- Second Brain — Supabase Schema
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ── TABLES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_id   TEXT        UNIQUE NOT NULL,
  plan          TEXT        DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  message_count INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  embedding   VECTOR(1536),
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS users_whatsapp_id_idx
  ON users(whatsapp_id);

CREATE INDEX IF NOT EXISTS memories_user_id_idx
  ON memories(user_id);

-- Vektör benzerlik (cosine, IVFFlat)
CREATE INDEX IF NOT EXISTS memories_embedding_idx
  ON memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Türkçe tam metin araması
CREATE INDEX IF NOT EXISTS memories_content_fts_idx
  ON memories USING gin(to_tsvector('turkish', content));

-- ── FUNCTIONS ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding  VECTOR(1536),
  match_user_id    UUID,
  match_threshold  FLOAT DEFAULT 0.5,
  match_count      INT   DEFAULT 5
)
RETURNS TABLE (
  id          UUID,
  content     TEXT,
  metadata    JSONB,
  similarity  FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.content, m.metadata,
         1 - (m.embedding <=> query_embedding) AS similarity
  FROM   memories m
  WHERE  m.user_id = match_user_id
    AND  1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER  BY m.embedding <=> query_embedding
  LIMIT  match_count;
END;
$$;

CREATE OR REPLACE FUNCTION increment_message_count(user_id_param UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE users
  SET    message_count = message_count + 1,
         updated_at    = NOW()
  WHERE  id = user_id_param;
END;
$$;
