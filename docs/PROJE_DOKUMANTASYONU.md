# SECOND BRAIN — Proje Dokümantasyonu
> "Unutma zahmetini yapay zekâya devret."

**Versiyon 2.0 | Mart 2026**

| Bilgi | Değer |
|---|---|
| Proje Adı | Second Brain |
| Domain | secondbrain.com.tr |
| Geliştirici | Kürşat Emre (OrionSoft.dev) |
| Durum | Phase 1 – MVP Geliştirme Aşaması |
| Lisans | Proprietary / Ticari |

---

## İçindekiler

1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Teknik Mimari](#2-teknik-mimari)
3. [WhatsApp API Yapılandırması](#3-whatsapp-api-yapılandırması)
4. [İş Akışı (Core Logic)](#4-iş-akışı-core-logic)
5. [Güvenlik Mimarisi](#5-güvenlik-mimarisi)
6. [Hata Yönetimi ve Dayanıklılık](#6-hata-yönetimi-ve-dayanıklılık)
7. [Ses İşleme Detayları](#7-ses-işleme-detayları)
8. [Veri Gizliliği ve KVKK Uyumu](#8-veri-gizliliği-ve-kvkk-uyumu)
9. [Deployment ve Operasyonel Yönetim](#9-deployment-ve-operasyonel-yönetim)
10. [Gelir Modeli ve Fiyatlandırma](#10-gelir-modeli-ve-fiyatlandırma)
11. [Yol Haritası (Roadmap)](#11-yol-haritası-roadmap)
12. [Grup Hafızası Tasarım Notları](#12-grup-hafızası-tasarım-notları)
13. [Çevresel Değişkenler (.env)](#13-çevresel-değişkenler-env)
14. [Sonuç ve Öncelik Matrisi](#14-sonuç-ve-öncelik-matrisi)

---

## 1. Yönetici Özeti

Second Brain, kullanıcıların WhatsApp üzerinden gönderdiği her türlü bilgiyi (metin, ses, link, görsel) kaydeden ve yapay zekâ yardımıyla bu bilgileri anlamsal olarak geri çağıran bir dijital hafıza asistanıdır.

Proje, RAG (Retrieval-Augmented Generation) mimarisini WhatsApp'ın yaygın kullanım alışkanlıklarıyla birleştirerek, kullanıcıların herhangi bir yeni uygulama indirmesine gerek kalmadan dijital hafızalarını yönetmelerine olanak tanır. Hedef kitle, bilgi yoğunluğu yüksek iş akışlarına sahip profesyoneller ve öğrencilerdir.

### 1.1 Temel Değer Önermesi

- **Sıfır Kurulum:** Mevcut WhatsApp alışkanlıkları üzerinden çalışır, yeni uygulama gerekmez.
- **Anlamsal Arama:** Anahtar kelime yerine anlam bazlı sorgulama ile doğru bilgiye hızla ulaşım.
- **Çoklu Ortam Desteği:** Metin, ses, URL ve görsel türünde içerikleri otomatik işler.
- **Doğal Dil Yanıt:** GPT-4o ile işlenen veriler, konuşma dilinde özetlenerek kullanıcıya iletilir.

---

## 2. Teknik Mimari

### 2.1 Sistem Mimarisi Genel Bakış

| Katman | Teknoloji | Amaç |
|---|---|---|
| Frontend (Landing) | Next.js 14+, Tailwind CSS, Framer Motion | Pazarlama sayfası, kullanıcı paneli |
| Backend API | Node.js (Next.js API Routes) – /api/* | Webhook işleme, iş mantığı, API routing |
| Veritabanı | Supabase (PostgreSQL + pgvector) | Veri saklama, vektör arama, RLS güvenlik |
| LLM | OpenAI GPT-4o-mini | Doğal dil yanıt üretimi, bağlam işleme |
| Embedding | text-embedding-3-small (1536D) | Metin vektörleştirme |
| STT (Ses) | Groq Whisper-v3 | Ses dosyalarını metne dönüştürme |
| URL İşleme | Firecrawl API | Web sayfalarını Markdown içeriğine dönüştürme |
| Mesajlaşma | Meta Cloud API v22.0 | WhatsApp entegrasyonu |
| Deployment | Vercel (Frontend + Serverless) | Hosting, CI/CD |

### 2.2 Veritabanı Şeması

`memories` tablosu:

| Kolon | Tip | Açıklama |
|---|---|---|
| id | UUID (PK) | Benzersiz kayıt kimliği, otomatik üretilir |
| user_id | VARCHAR(20) | WhatsApp telefon numarası (E.164 format) |
| content_type | ENUM | text \| audio \| url \| image |
| raw_text | TEXT | Orijinal veya transkript edilmiş içerik |
| processed_text | TEXT | Özetlenmiş / temizlenmiş içerik |
| source_url | TEXT (nullable) | URL kaynağı (varsa) |
| embedding | vector(1536) | pgvector formatında embedding vektörü |
| metadata | JSONB | Ek bilgiler: dosya adı, süre, etiketler vb. |
| created_at | TIMESTAMPTZ | Kayıt oluşturma zamanı |
| updated_at | TIMESTAMPTZ | Son güncelleme zamanı |
| is_deleted | BOOLEAN | Soft-delete flagi (varsayılan: false) |

### 2.2.1 İndeks Stratejisi

Vektör arama performansı için **HNSW** indeksi önerilir (IVFFlat'a göre daha tutarlı, yeniden eğitim gerektirmez).

- İndeks tipi: **HNSW** (ivfflat alternatif)
- Similarity metrik: **Cosine Similarity** (`<=>`)
- `ef_construction`: 200, `ef_search`: 100
- Tahmini kapasite: 10M vektöre kadar tek node'da performanslı

```sql
-- Mevcut schema.sql'de IVFFlat kullanılıyor.
-- Production'da HNSW'ye geçiş önerilir:
CREATE INDEX idx_memories_embedding ON memories
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);

CREATE INDEX idx_memories_user ON memories (user_id, created_at DESC);
```

---

## 3. WhatsApp API Yapılandırması

### 3.1 Meta Cloud API Bilgileri

| Parametre | Değer |
|---|---|
| API Versiyonu | v22.0 |
| Phone Number ID | 986483727887530 |
| Business Account ID | 25989316177416056 |
| Webhook Endpoint | POST /api/webhook (Vercel Serverless) |

### 3.2 Webhook Güvenliği

- **X-Hub-Signature Doğrulama:** Her gelen webhook isteğinin `X-Hub-Signature-256` header'ı, app secret ile HMAC-SHA256 kullanılarak doğrulanmalıdır.
- **Verify Token:** Webhook kurulumunda kullanılan verify token, çevresel değişken olarak saklanmalı.
- **IP Whitelisting:** Meta'nın resmi IP aralıkları dışındaki istekler reddedilmeli (production).

> ⚠️ **Kritik Güvenlik Notu:** Webhook imza doğrulaması olmadan, herhangi bir kişi sahte webhook istekleri göndererek sisteme yetkisiz veri enjekte edebilir. **Production'a geçmeden önce mutlaka implement edilmeli.**

---

## 4. İş Akışı (Core Logic)

### 4.1 Mesaj İşleme Pipeline'ı

| Adım | Süreç | Servis | Hata Durumu |
|---|---|---|---|
| 1. Alım | Webhook mesajı alınır ve tip belirlenir | Express Middleware | Meta imza hatası → 400 dön |
| 2. Ön İşleme | Tip bazlı içerik çıkarımı (STT, URL scrape) | Groq / Firecrawl | 3x retry, sonra kullanıcıya bilgi |
| 3. Vektörleştirme | İçerik embedding vektörüne dönüştürülür | OpenAI Embedding API | Fallback: ham metin olarak kaydet |
| 4. Kaydetme | Vektör + metin Supabase'e yazılır | Supabase Client | DB hatası → retry queue'ya ekle |
| 5. Onay | Kullanıcıya başarılı kayıt mesajı gönderilir | WhatsApp API | Silent fail, log kaydı |

### 4.2 Sorgulama Akışı (RAG Pipeline)

1. **Niyet Tespiti:** Mesajın kaydetme mi yoksa sorgulama mı olduğu belirlenir.
2. **Soru Vektörleştirme:** Kullanıcının sorusu aynı embedding modeli ile vektöre dönüştürülür.
3. **Similarity Search:** Supabase üzerinde Cosine Similarity ile en alakalı `top_k=5` anı getirilir (`similarity_threshold ≥ 0.75`).
4. **Context Assembly:** Getirilen anılar tarih ve tip bilgileriyle birlikte GPT-4o'ya gönderilir.
5. **Yanıt Üretimi:** GPT-4o doğal dilde yanıt üretir ve WhatsApp üzerinden iletir.

### 4.3 Hybrid Search Stratejisi (Önerilen — Phase 2)

```
final_score = 0.7 × semantic_score + 0.2 × keyword_score + 0.1 × recency_score
```

- **Semantic Search:** Cosine similarity (mevcut sistem)
- **Keyword Search:** PostgreSQL `ts_vector + ts_query`
- **Zaman Filtresi:** "son 1 hafta", "dün" gibi ifadeler parse edilerek `created_at` filtresi

---

## 5. Güvenlik Mimarisi

### 5.1 Kimlik Doğrulama

- **Meta API Doğrulaması:** `X-Hub-Signature-256` ile imza doğrulaması (**P0 — yapılacak**)
- **User ID Formatı:** E.164 normalize (+905551234567)
- **Rate Limiting:** 10 mesaj/dakika, 100 mesaj/saat / kullanıcı

### 5.2 Supabase Row Level Security (RLS)

```sql
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data" ON memories
  FOR ALL USING (user_id = current_setting('app.user_id'));

-- Backend her istekte kullanıcı ID'sini set eder:
SET LOCAL app.user_id = '+905551234567';
```

> ⚠️ **RLS production'a geçmeden önce aktif edilmeli (P0).**

### 5.3 API Anahtar Rotasyon Periyotları

| Anahtar | Rotasyon |
|---|---|
| Meta App Secret | 6 ayda bir |
| OpenAI API Key | 3 ayda bir |
| Groq / Firecrawl Key | 3 ayda bir |
| Supabase Service Key | 3 ayda bir |

### 5.4 Rate Limiting

| Katman | Limit | Aşıldığında |
|---|---|---|
| Mesaj/Dakika | 10/kullanıcı | 429 + WhatsApp uyarısı |
| Mesaj/Saat | 100/kullanıcı | 429 + bekleme süresi |
| Ses Dosyası | Maks. 10 MB / 5 dk | Uyarı mesajı |
| URL Scrape/Gün | 50 URL/kullanıcı | Limit bildirimi |
| Global API | 1000 req/dakika | Queue'ya al |

---

## 6. Hata Yönetimi ve Dayanıklılık

### 6.1 Retry Stratejisi

| Servis | Maks. Retry | Backoff | Fallback |
|---|---|---|---|
| OpenAI Embedding | 3 | 1s → 2s → 4s | Ham metni embedding'siz kaydet |
| OpenAI GPT-4o | 3 | 1s → 2s → 4s | "Şu an yanıt üretemiyorum" |
| Groq Whisper | 3 | 2s → 4s → 8s | "Ses işlenemedi, metin gönderin" |
| Firecrawl | 2 | 1s → 3s | Basit URL meta verisi kaydet |
| Supabase Write | 3 | 500ms → 1s → 2s | Dead letter queue |
| WhatsApp Send | 2 | 1s → 2s | Log + sessiz hata |

### 6.2 Dead Letter Queue

Başarısız mesajlar `failed_messages` tablosuna yazılır. Her 15 dakikada cron job yeniden dener. 24 saat sonra "kalıcı hata" olarak işaretlenir.

### 6.3 Kullanıcı Bildirimleri

- `✅ Anınız kaydedildi!`
- `⚠️ Ses dosyanızı işleyemedik. Lütfen tekrar deneyin.`
- `⏳ Sistemimiz şu an yoğun. Mesajınız sıraya alındı.`
- `❌ Günlük mesaj limitinize ulaştınız. Premium'a geçin!`

---

## 7. Ses İşleme Detayları

### 7.1 Ses İndirme Akışı

1. `audio.id` → Media ID alımı
2. `GET /v22.0/{media_id}` → Download URL
3. Bearer token ile OGG/OPUS indirme
4. Groq Whisper-v3 (`whisper-large-v3`, `language: tr`)
5. Geçici dosya silme → transkript pipeline'a

### 7.2 Kısıtlamalar

| Kısıt | Değer | Çözüm |
|---|---|---|
| Maks. boyut | 10 MB | Boyut aşımında uyarı |
| Maks. süre | 5 dakika | ffmpeg ile chunk'lara böl |
| Desteklenen formatlar | OGG, OPUS, MP3, M4A | WhatsApp zaten OGG gönderir |
| Türkçe doğruluk | ~%92-95 (Whisper-v3) | Post-processing ile iyileştirme |

---

## 8. Veri Gizliliği ve KVKK Uyumu

> ⚠️ **Yasal Zorunluluk:** 6698 sayılı KVKK kapsamında veri sorumlusu yükümlülükleri yerine getirilmelidir.

### 8.1 Zorunlu Dökümanlar

| Döküman | Durum |
|---|---|
| Aydınlatma Metni | ⭕ Hazırlanacak (ilk mesajda otomatik gönderilecek) |
| Açık Rıza Metni | ⭕ Hazırlanacak (ses + URL işleme için) |
| VERBİS Kaydı | ⭕ Yapılacak |
| Gizlilik Politikası | ✅ secondbrain.com.tr/gizlilik |
| KVKK Aydınlatma | ✅ secondbrain.com.tr/kvkk |

### 8.2 Veri Saklama ve Silme Politikası

- **Aktif kullanıcı:** Abonelik süresi boyunca
- **Pasif hesap:** 6 ay sonra anonimleştirme
- **Silme talebi:** "tüm verilerimi sil" komutuyla 72 saat içinde hard-delete
- **Loglar:** Kişisel içerik loglanmaz, sadece event tipleri + zaman damgası

---

## 9. Deployment ve Operasyonel Yönetim

### 9.1 Deployment Mimarisi

| Bileşen | Platform | Yapılandırma |
|---|---|---|
| Frontend + Backend | Vercel | Next.js SSR + Serverless Functions |
| Veritabanı | Supabase Cloud | Free tier (MVP) → Pro ($25/mo) |
| Domain | secondbrain.com.tr | Vercel DNS, SSL otomatik |

### 9.2 CI/CD Pipeline

- **Feature Branch:** `feature/xxx` branch'ı
- **Preview Deploy:** PR açıldığında otomatik preview URL
- **Main Merge:** Production'a otomatik deploy
- **Rollback:** Vercel dashboard'dan anında geri dönüş

### 9.3 Monitoring

| Araç | Amaç |
|---|---|
| Vercel Analytics | Frontend performans |
| Sentry | Backend hata takibi (⭕ eklenecek) |
| Supabase Dashboard | DB performans |
| UptimeRobot | Webhook endpoint sağlık kontrolü |

### 9.4 Test Stratejisi

| Tip | Araç | Kapsam |
|---|---|---|
| Unit | Jest | Embedding servisi, mesaj parser, rate limiter |
| Integration | Jest + Supertest | Webhook endpoint, Supabase CRUD, RAG pipeline |
| E2E | Manuel | WhatsApp'tan mesaj → sorgulama döngüsü |
| Load | k6 / Artillery | 100 eş zamanlı kullanıcı |

---

## 10. Gelir Modeli ve Fiyatlandırma

### 10.1 Katmanlı Fiyatlandırma

| Özellik | Free Tier | Premium (150 TL/ay) |
|---|---|---|
| Aylık Mesaj | 50 mesaj | Sınırsız |
| Ses Kaydı | 10 ses/ay (maks. 1 dk) | Sınırsız (maks. 5 dk) |
| URL Kaydetme | 10 URL/ay | 50 URL/gün |
| Anlamsal Arama | Temel (top_k=3) | Gelişmiş (top_k=10, hybrid) |
| Veri Saklama | 30 gün | Sınırsız |
| Destek | Topluluk | Öncelikli WhatsApp |

### 10.2 Ödeme Altyapısı

| Sağlayıcı | Avantaj | Komisyon |
|---|---|---|
| **iyzico** (önerilen MVP) | Türk pazarına özel | %2.49 + 0.30 TL |
| Stripe | Global standart | %2.9 + $0.30 |
| Paddle | SaaS optimize | %5 + $0.50 |

### 10.3 Maliyet Analizi (Aylık)

| Kalem | 100 kullanıcı | 500 premium kullanıcı |
|---|---|---|
| OpenAI API | ~$15 | ~$120 |
| Groq API | Ücretsiz | ~$30 |
| Firecrawl | ~$10 | ~$50 |
| Supabase | Ücretsiz | $25 |
| Vercel | Ücretsiz | $20 |
| **Toplam** | **~$25/ay** | **~$245/ay** |

**Break-even:** 500 premium × 150 TL = 75.000 TL/ay gelir vs ~8.000 TL maliyet → **%89 kar marjı**

---

## 11. Yol Haritası (Roadmap)

### Phase 1 – MVP (Mart – Nisan 2026) 🔄

- [ ] Metin, ses ve URL kaydetme
- [ ] Temel RAG sorgulama (semantic search)
- [ ] **Webhook X-Hub-Signature doğrulaması** ← P0
- [ ] **Supabase RLS politikaları** ← P0
- [ ] **KVKK aydınlatma + açık rıza akışı** ← P0
- [ ] Rate limiting
- [ ] Retry + fallback mekanizması
- [ ] Kullanıcı hata bildirimleri

### Phase 2 – Beta Lançman (Mayıs – Temmuz 2026)

- [ ] Landing page canlı (✅ hazır)
- [ ] Kullanıcı onboarding akışı
- [ ] iyzico ödeme entegrasyonu
- [ ] Kullanıcı dashboardı
- [ ] Hybrid search
- [ ] Sentry monitoring

### Phase 3 – Grup Hafızası (Ağustos – Ekim 2026)

- [ ] WhatsApp grup entegrasyonu (@mention)
- [ ] Grup yönetici paneli
- [ ] Grup bazlı fiyatlandırma

### Phase 4 – Ölçekleme (Q4 2026+)

- [ ] Telegram + Slack entegrasyonu
- [ ] Web clip browser extension
- [ ] API erişimi (geliştiriciler)
- [ ] Multi-language desteği

---

## 12. Grup Hafızası Tasarım Notları

### 12.1 Tetikleme

Bot yalnızca `@SecondBrain` etiketiyle tetiklenir. Etiketsiz mesajlar işlenmez.

### 12.2 Yetki Matrisi

| Rol | Kaydetme | Sorgulama | Üye Yönetimi | Veri Silme |
|---|---|---|---|---|
| Grup Yöneticisi | ✅ | ✅ | ✅ | ✅ |
| Üye | ✅ | ✅ | ❌ | Sadece kendi |
| Salt Okunur | ❌ | ✅ | ❌ | ❌ |

### 12.3 Üye Ayrılma Politikası

Üye ayrıldığında katkıları grupta kalır (varsayılan). KVKK talebiyle `user_id → "eski_uye"` anonimleştirme yapılır.

---

## 13. Çevresel Değişkenler (.env)

| Değişken | Açıklama |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | Meta API Bearer Token |
| `PHONE_NUMBER_ID` | WhatsApp Phone Number ID: 986483727887530 |
| `WEBHOOK_VERIFY_TOKEN` | Webhook verify token (kendin belirle) |
| `META_APP_SECRET` | X-Hub-Signature doğrulaması için (**P0**) |
| `OPENAI_API_KEY` | GPT-4o-mini + Embedding API |
| `GROQ_API_KEY` | Whisper STT servisi |
| `FIRECRAWL_API_KEY` | URL scraping servisi |
| `SUPABASE_URL` | Supabase proje URL'i |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (backend) |
| `KV_REST_API_URL` | Upstash Redis REST URL (waitlist counter) |
| `KV_REST_API_TOKEN` | Upstash Redis token |
| `SENTRY_DSN` | Hata takip sistemi (**Phase 2**) |

---

## 14. Sonuç ve Öncelik Matrisi

| Öncelik | Madde | Faz | Durum |
|---|---|---|---|
| **P0 – Kritik** | Webhook X-Hub-Signature doğrulaması | MVP | ⭕ Yapılacak |
| **P0 – Kritik** | Supabase RLS politikaları | MVP | ⭕ Yapılacak |
| **P0 – Kritik** | KVKK aydınlatma + açık rıza | MVP | ⭕ Yapılacak |
| **P1 – Yüksek** | Rate limiting implementasyonu | MVP | ⭕ Yapılacak |
| **P1 – Yüksek** | Retry + fallback mekanizması | MVP | ⭕ Yapılacak |
| **P1 – Yüksek** | Kullanıcı hata bildirimleri | MVP | ⭕ Yapılacak |
| **P2 – Orta** | Sentry monitoring | Beta | ⭕ Yapılacak |
| **P2 – Orta** | Hybrid search | Beta | ⭕ Yapılacak |
| **P2 – Orta** | iyzico ödeme entegrasyonu | Beta | ⭕ Yapılacak |
| **P3 – Düşük** | Grup hafızası mimarisi | Phase 3 | ⭕ Planlanacak |

---

*Second Brain – Proje Dokümantasyonu v2.0 | © 2026 OrionSoft.dev*
