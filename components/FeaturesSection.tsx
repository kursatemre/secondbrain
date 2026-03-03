"use client";

import { motion } from "framer-motion";
import { Mic, Link2, Camera, Users, Zap, Globe } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const WAVEFORM = [3, 7, 11, 5, 14, 9, 13, 7, 5, 11, 4, 9, 13, 6, 10];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF9D]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono text-[#00FF9D] uppercase tracking-[0.2em] mb-4 block">
            Özellikler
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold">
            Hafızanın{" "}
            <span className="text-[#00FF9D]">Her Biçimi</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* --- Card 1: Sesli Not --- */}
          <motion.div
            variants={itemVariants}
            className="relative bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 overflow-hidden group hover:border-[#00FF9D]/22 transition-all duration-300 min-h-[280px] flex flex-col"
          >
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#00FF9D]/4 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-[#00FF9D]/6" />

            <div className="w-11 h-11 rounded-xl bg-[#00FF9D]/8 border border-[#00FF9D]/20 flex items-center justify-center mb-4">
              <Mic className="w-5 h-5 text-[#00FF9D]" />
            </div>

            <h3 className="font-heading text-xl font-bold text-white mb-2">
              Sesli Not Hafızası
            </h3>
            <p className="text-sm text-white/45 leading-relaxed mb-4 flex-1">
              Groq Whisper-v3 ile saniyeler içinde transkript. Semantik arama
              ile &quot;söylediğimi bul.&quot;
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-3.5 h-3.5 text-[#00FF9D]" />
              <span className="text-xs text-[#00FF9D] font-medium">
                Groq hızıyla — &lt;2 saniye
              </span>
            </div>

            {/* Animated waveform */}
            <div className="flex items-end gap-0.5 h-8">
              {WAVEFORM.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-[#00FF9D]/25 rounded-sm group-hover:bg-[#00FF9D]/40 transition-colors"
                  style={{ height: `${h * 2}px` }}
                  animate={{
                    height: [`${h * 2}px`, `${h * 3.2}px`, `${h * 2}px`],
                  }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* --- Card 2: Akıllı Link Özetleme --- */}
          <motion.div
            variants={itemVariants}
            className="relative bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 overflow-hidden group hover:border-[#00FF9D]/22 transition-all duration-300 min-h-[280px] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-36 h-36 bg-[#00FF9D]/3 rounded-full blur-2xl pointer-events-none" />

            <div className="w-11 h-11 rounded-xl bg-[#00FF9D]/8 border border-[#00FF9D]/20 flex items-center justify-center mb-4">
              <Link2 className="w-5 h-5 text-[#00FF9D]" />
            </div>

            <h3 className="font-heading text-xl font-bold text-white mb-2">
              Akıllı Link Özetleme
            </h3>
            <p className="text-sm text-white/45 leading-relaxed mb-4 flex-1">
              Firecrawl ile sayfayı temiz Markdown&apos;a dönüştür. Otomatik
              key-point&apos;ler ve etiketler.
            </p>

            {/* Link preview mockup */}
            <div className="bg-black/40 rounded-xl p-3 border border-white/5 mt-auto">
              <div className="flex items-center gap-2 mb-2.5">
                <Globe className="w-3 h-3 text-[#00FF9D]/70" />
                <span className="text-[10px] text-white/35 font-mono truncate">
                  firecrawl.dev → markdown
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-white/6 rounded" />
                <div className="h-1.5 w-4/5 bg-white/6 rounded" />
                <div className="h-1.5 w-3/5 bg-[#00FF9D]/18 rounded" />
                <div className="flex gap-1.5 mt-2">
                  {["#ML", "#MIT", "#öğrenme"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 bg-[#00FF9D]/10 border border-[#00FF9D]/15 rounded text-[#00FF9D]/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- Card 3: Görsel Analiz --- */}
          <motion.div
            variants={itemVariants}
            className="relative bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 overflow-hidden group hover:border-[#00FF9D]/22 transition-all duration-300 min-h-[280px] flex flex-col md:col-span-2 lg:col-span-1"
          >
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#00FF9D]/3 rounded-full blur-2xl pointer-events-none" />

            <div className="w-11 h-11 rounded-xl bg-[#00FF9D]/8 border border-[#00FF9D]/20 flex items-center justify-center mb-4">
              <Camera className="w-5 h-5 text-[#00FF9D]" />
            </div>

            <h3 className="font-heading text-xl font-bold text-white mb-2">
              Görsel Analiz
            </h3>
            <p className="text-sm text-white/45 leading-relaxed mb-4 flex-1">
              Fatura, reçete, el yazısı not — fotoğraf gönder, GPT-4o Vision
              analiz etsin ve kaydetsin.
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {["Fatura", "Reçete", "El Yazısı", "Kartvizit", "Not"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-1 bg-white/4 border border-white/8 rounded-lg text-white/40 group-hover:border-[#00FF9D]/12 transition-colors"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </motion.div>

          {/* --- Card 4: Grup Hafızası (LARGE) --- */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-[#0A1510] via-[#0A0A0A] to-[#0A0A0A] border border-[#00FF9D]/18 rounded-2xl p-6 sm:p-8 overflow-hidden group hover:border-[#00FF9D]/30 transition-all duration-300 lg:col-span-3 min-h-[280px]"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9D]/4 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF9D]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#00FF9D]/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-start gap-8">
              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#00FF9D]/10 border border-[#00FF9D]/25 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#00FF9D]" />
                  </div>
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-3 py-1 bg-[#00FF9D]/10 border border-[#00FF9D]/25 rounded-full text-xs text-[#00FF9D] font-bold font-mono tracking-wider"
                  >
                    YAKINDA
                  </motion.span>
                </div>

                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
                  Grup Hafızası
                </h3>
                <p className="text-base text-white/45 leading-relaxed max-w-lg mb-6">
                  İş grubundaki kararları, aile planlarını — tüm grup hafızasını AI
                  ile yönet. &quot;Geçen hafta ne kararlaştırmıştık?&quot; sorusunun
                  cevabı anında.
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    "İş Grubu Asistanı",
                    "Aile Hatırlatıcısı",
                    "Karar Takibi",
                    "Ortak Hafıza",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-[#00FF9D]/10 rounded-lg group-hover:border-[#00FF9D]/20 transition-colors"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
                      <span className="text-xs text-white/55">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Group chat preview */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-black/50 rounded-2xl p-4 border border-white/6">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                    <div className="w-7 h-7 rounded-full bg-[#00FF9D]/15 border border-[#00FF9D]/20 flex items-center justify-center">
                      <span className="text-[8px] font-black text-[#00FF9D]">
                        İŞ
                      </span>
                    </div>
                    <span className="text-xs text-white/55 font-medium">
                      Startup Ekibi
                    </span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                  </div>

                  {[
                    { user: "Ali K.", msg: "Fiyatı 150'ye çıkaralım mı?", isBot: false },
                    {
                      user: "Second Brain",
                      msg: "📌 3 gün önce 120 TL kararı alınmıştı. Referans: toplantı notu.",
                      isBot: true,
                    },
                  ].map((m, i) => (
                    <div key={i} className={`mb-2.5 ${m.isBot ? "" : "text-right"}`}>
                      <span
                        className={`text-[9px] font-medium ${
                          m.isBot ? "text-[#00FF9D]" : "text-white/35"
                        }`}
                      >
                        {m.user}
                      </span>
                      <div
                        className={`mt-0.5 inline-block px-2.5 py-1.5 rounded-xl text-[10px] leading-snug ${
                          m.isBot
                            ? "bg-[#00FF9D]/8 border border-[#00FF9D]/18 text-white/65"
                            : "bg-white/5 text-white/45"
                        }`}
                      >
                        {m.msg}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-center pt-2 border-t border-white/5 mt-1">
                    <span className="text-[10px] text-[#00FF9D]/50 font-mono">
                      Çok yakında geliyor...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
