-- ============================================================
-- Migration 003: Hibrit arama fonksiyonu (profesyonel + sinirsiz)
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ============================================================

-- Semantic + full-text aramasını birleştirir.
-- Semantic miss'lerini Türkçe keyword eşleşmesiyle tamamlar.
-- ts_rank * 0.5 ile normalize: cosine similarity değerleriyle karşılaştırılabilir.

CREATE OR REPLACE FUNCTION match_memories_hybrid(
  query_embedding  VECTOR(1536),
  query_text       TEXT,
  match_user_id    UUID,
  match_threshold  FLOAT DEFAULT 0.3,
  match_count      INT   DEFAULT 8
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
  WITH semantic AS (
    SELECT m.id, m.content, m.metadata,
           (1 - (m.embedding <=> query_embedding)) AS sim
    FROM   memories m
    WHERE  m.user_id = match_user_id
      AND  (1 - (m.embedding <=> query_embedding)) > match_threshold
  ),
  fulltext AS (
    SELECT m.id, m.content, m.metadata,
           ts_rank(to_tsvector('turkish', m.content),
                   plainto_tsquery('turkish', query_text)) * 0.5 AS sim
    FROM   memories m
    WHERE  m.user_id = match_user_id
      AND  to_tsvector('turkish', m.content)
             @@ plainto_tsquery('turkish', query_text)
  ),
  combined AS (
    SELECT id, content, metadata, sim FROM semantic
    UNION ALL
    SELECT id, content, metadata, sim FROM fulltext
  ),
  ranked AS (
    SELECT id, content, metadata, MAX(sim) AS best_sim
    FROM   combined
    GROUP  BY id, content, metadata
  )
  SELECT id, content, metadata, best_sim AS similarity
  FROM   ranked
  ORDER  BY best_sim DESC
  LIMIT  match_count;
END;
$$;
