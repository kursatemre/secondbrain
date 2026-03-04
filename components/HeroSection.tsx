"use client";

import { motion } from "framer-motion";
import WhatsAppMockup from "./WhatsAppMockup";

const WHATSAPP_URL = "https://wa.me/15558587000";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
      style={{ backgroundColor: "#0f1117" }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,255,157,0.06) 0%, transparent 68%)",
          }}
        />
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 68%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Sol: Metin ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            {/* Live badge */}
            <div className="flex justify-center lg:justify-start mb-6">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono"
                style={{
                  background: "rgba(0,255,157,0.08)",
                  border: "1px solid rgba(0,255,157,0.2)",
                  color: "#00ff9d",
                }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] inline-block"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                BETA · Yayında
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.1rem] font-bold leading-[1.08] mb-5 tracking-tight">
              Artık Her Şey{" "}
              <span style={{ color: "#00ff9d" }}>Aklında&nbsp;Kalıyor</span>{" "}
              🧠
            </h1>

            <p className="text-lg text-white/45 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              WhatsApp&apos;a not, link veya ses at —{" "}
              <span className="text-white/65">
                Second Brain kaydeder, bulur, hatırlatır.
              </span>{" "}
              Kurulum yok. Uygulama indirme yok. Sadece bir mesaj gönder.
            </p>

            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 px-8 py-4 text-black font-bold text-base rounded-2xl"
              style={{
                background: "#00ff9d",
                boxShadow: "0 0 35px rgba(0,255,157,0.32)",
              }}
            >
              <WhatsAppIcon />
              WhatsApp&apos;ta Hemen Başla — Ücretsiz
            </motion.a>

            <p className="text-sm text-white/28 mt-4">
              Kredi kartı gerekmez · 30 mesaj ücretsiz · İstediğin zaman iptal et
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-5 justify-center lg:justify-start mt-8">
              {[
                { val: "30", label: "ücretsiz mesaj" },
                { val: "7/24", label: "erişim" },
                { val: "%100", label: "WhatsApp üzerinden" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="font-bold text-sm" style={{ color: "#00ff9d" }}>{s.val}</span>
                  <span className="text-xs text-white/35">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Sağ: WhatsApp Mockup ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="flex justify-center lg:justify-end order-1 lg:order-2"
          >
            <WhatsAppMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #0f1117, transparent)",
        }}
      />
    </section>
  );
}
