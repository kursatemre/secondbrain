-- ============================================================
-- Migration 002: Aylık kullanım limitleri
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ============================================================

-- Plan constraint'i güncelle (yeni plan adları)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'kisisel', 'profesyonel', 'sinirsiz'));

-- Aylık kullanım sayaçları
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS monthly_messages INT        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_audio    INT        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_urls     INT        DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usage_reset_at  TIMESTAMPTZ DEFAULT date_trunc('month', NOW());

-- ── USAGE CHECK + INCREMENT ──────────────────────────────────
-- Ay başında sayaçları sıfırlar, limiti kontrol eder, izin varsa artırır.
-- type: 'message' | 'audio' | 'url'
-- Döner: { allowed: bool, count: int, limit: int }

CREATE OR REPLACE FUNCTION check_and_increment_usage(
  user_id_param UUID,
  usage_type    TEXT
)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  u            RECORD;
  month_start  TIMESTAMPTZ := date_trunc('month', NOW());
  limit_val    INT;
  current_val  INT;
BEGIN
  SELECT * INTO u FROM users WHERE id = user_id_param FOR UPDATE;

  -- Ay değiştiyse sayaçları sıfırla
  IF u.usage_reset_at < month_start THEN
    UPDATE users
    SET monthly_messages = 0,
        monthly_audio    = 0,
        monthly_urls     = 0,
        usage_reset_at   = month_start
    WHERE id = user_id_param;
    u.monthly_messages := 0;
    u.monthly_audio    := 0;
    u.monthly_urls     := 0;
  END IF;

  -- Plan limitlerini belirle
  IF usage_type = 'message' THEN
    -- Free plan: toplam (lifetime) mesaj sayısı kullanılır, aylık sıfırlanmaz
    IF u.plan = 'free' THEN
      current_val := u.message_count;
      limit_val   := 30;
    ELSE
      current_val := u.monthly_messages;
      limit_val := CASE u.plan
        WHEN 'kisisel'     THEN 150
        WHEN 'profesyonel' THEN 500
        WHEN 'sinirsiz'    THEN 3000
        ELSE 30
      END;
    END IF;

  ELSIF usage_type = 'audio' THEN
    current_val := u.monthly_audio;
    limit_val := CASE u.plan
      WHEN 'free'        THEN 0
      WHEN 'kisisel'     THEN 20
      WHEN 'profesyonel' THEN 999999
      WHEN 'sinirsiz'    THEN 999999
      ELSE 0
    END;

  ELSIF usage_type = 'url' THEN
    current_val := u.monthly_urls;
    limit_val := CASE u.plan
      WHEN 'free'        THEN 5
      WHEN 'kisisel'     THEN 20
      WHEN 'profesyonel' THEN 200
      WHEN 'sinirsiz'    THEN 999999
      ELSE 5
    END;

  ELSE
    RETURN jsonb_build_object('allowed', false, 'count', 0, 'limit', 0);
  END IF;

  -- Limit aşıldıysa izin verme
  IF current_val >= limit_val THEN
    RETURN jsonb_build_object('allowed', false, 'count', current_val, 'limit', limit_val);
  END IF;

  -- Sayacı artır
  IF usage_type = 'message' THEN
    -- Free plan sadece message_count'u artırır (aylık sayaç yok)
    IF u.plan = 'free' THEN
      UPDATE users SET message_count = message_count + 1 WHERE id = user_id_param;
    ELSE
      UPDATE users SET monthly_messages = monthly_messages + 1,
                       message_count    = message_count + 1
      WHERE id = user_id_param;
    END IF;
  ELSIF usage_type = 'audio' THEN
    UPDATE users SET monthly_audio = monthly_audio + 1 WHERE id = user_id_param;
  ELSIF usage_type = 'url' THEN
    UPDATE users SET monthly_urls = monthly_urls + 1 WHERE id = user_id_param;
  END IF;

  RETURN jsonb_build_object('allowed', true, 'count', current_val + 1, 'limit', limit_val);
END;
$$;
