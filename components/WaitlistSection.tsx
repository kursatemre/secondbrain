"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ArrowRight, Users } from "lucide-react";

const WAITLIST_JOINED = 247;
const WAITLIST_MAX = 500;

// ─── Google Forms Yapılandırması ──────────────────────────────────────────────
// 1. forms.google.com → yeni form oluştur: Ad Soyad, WhatsApp Numarası, E-posta
// 2. Editörde  ⋮ → "Önceden doldurulmuş bağlantı al" → dummy değer gir → "Bağlantıyı al"
// 3. URL'deki FORM_ID ve entry.XXXXX değerlerini aşağıya yapıştır
const GF = {
  ACTION_URL:  "https://docs.google.com/forms/d/e/BURAYA_FORM_ID/formResponse",
  FIELD_NAME:  "entry.XXXXXXXXX", // Ad Soyad
  FIELD_PHONE: "entry.XXXXXXXXX", // WhatsApp Numarası
  FIELD_EMAIL: "entry.XXXXXXXXX", // E-posta (opsiyonel)
} as const;
// ─────────────────────────────────────────────────────────────────────────────

export default function WaitlistSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Ad soyad gerekli.");
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) {
      setError("Geçerli bir WhatsApp numarası gir (en az 10 haneli).");
      return;
    }
    setLoading(true);

    const body = new FormData();
    body.append(GF.FIELD_NAME, form.name.trim());
    body.append(GF.FIELD_PHONE, `+90 ${form.phone.trim()}`);
    if (form.email.trim()) body.append(GF.FIELD_EMAIL, form.email.trim());

    try {
      // no-cors: CORS hatası fırlatır ama veri Google Forms'a iletilir
      await fetch(GF.ACTION_URL, { method: "POST", mode: "no-cors", body });
    } catch {
      // no-cors modunda catch her zaman çalışır — ignore
    }

    setLoading(false);
    setSubmitted(true);
  };

  const progress = (WAITLIST_JOINED / WAITLIST_MAX) * 100;

  return (
    <section
      id="waitlist"
      className="py-28 relative overflow-hidden"
      style={{ backgroundColor: "#0f1117" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff9d]/20 to-transparent" />

      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(0,255,157,0.05) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-xs font-mono text-[#00ff9d] uppercase tracking-[0.2em] mb-4 block">
            Beta Bekleme Listesi
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            Önce Sen{" "}
            <span style={{ color: "#00ff9d" }}>Dene</span>
          </h2>
          <p className="text-white/40 text-base">
            Numaranı bırak, beta açılınca WhatsApp üzerinden ulaşalım.
          </p>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-white/40">
                <Users className="w-3.5 h-3.5" />
                <span>{WAITLIST_JOINED} kişi katıldı</span>
              </div>
              <span className="font-mono font-bold" style={{ color: "#00ff9d" }}>
                {WAITLIST_MAX - WAITLIST_JOINED} yer kaldı
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #00ff9d, #00d4ff)",
                }}
              />
            </div>
            <p className="text-[11px] text-white/20 mt-1.5 text-right">
              İlk 500 kişiye özel davetiye
            </p>
          </div>
        </motion.div>

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
              style={{
                background: "rgba(20, 26, 46, 0.5)",
                border: "1px solid rgba(0,255,157,0.1)",
              }}
            >
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">
                    Ad Soyad{" "}
                    <span style={{ color: "#00ff9d" }}>*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Adın ve soyadın"
                    autoComplete="name"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none transition-colors"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(0,255,157,0.35)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.07)";
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">
                    WhatsApp Numarası{" "}
                    <span style={{ color: "#00ff9d" }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35 select-none pointer-events-none font-mono">
                      +90
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="555 123 4567"
                      autoComplete="tel"
                      className="w-full rounded-xl pl-[52px] pr-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none transition-colors"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(0,255,157,0.35)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.07)";
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">
                    E-posta{" "}
                    <span className="text-white/20">(opsiyonel)</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    autoComplete="email"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/22 focus:outline-none transition-colors"
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(0,212,255,0.3)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.07)";
                    }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400/80 flex items-center gap-1.5"
                  >
                    <span>⚠</span> {error}
                  </motion.p>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full flex items-center justify-center gap-2.5 py-4 text-black font-bold text-sm rounded-xl transition-all disabled:opacity-60"
                  style={{
                    background: "#00ff9d",
                    boxShadow: "0 0 25px rgba(0,255,157,0.25)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      Listeye Katıl &amp; Öncelik Kazan
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <p className="text-[11px] text-white/18 text-center">
                  Spam yok. Beta açılınca sadece bir kez WhatsApp mesajı
                  alırsın.
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="rounded-2xl p-10 text-center"
              style={{
                background: "rgba(12, 31, 24, 0.6)",
                border: "1px solid rgba(0,255,157,0.22)",
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "rgba(0,255,157,0.12)",
                  border: "1px solid rgba(0,255,157,0.3)",
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-[#00ff9d]" />
              </motion.div>

              <h3 className="font-heading text-2xl font-bold text-white mb-2">
                Harika! Listeye eklendin 🎉
              </h3>
              <p className="text-white/45 text-sm leading-relaxed mb-6">
                <span style={{ color: "#00ff9d" }}>
                  #{WAITLIST_JOINED + 1}
                </span>{" "}
                numaralı öncelik sırana girdin. Beta açılınca WhatsApp üzerinden
                davetiye alacaksın.
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-[#00ff9d]/60 font-mono">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-[#00ff9d]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                Bekleme listesinde...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
