-- ============================================================
-- Migration 006: 15 Günlük Ücretsiz Deneme
-- Supabase Dashboard → SQL Editor → Yapıştır → Run
-- ============================================================

-- Yeni kullanıcılar için trial bitiş tarihi
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Mevcut kullanıcılar etkilenmez (NULL kalır = trial yok)
-- Yeni kayıt: getOrCreateUser fonksiyonu otomatik set eder
