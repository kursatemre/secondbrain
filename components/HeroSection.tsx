"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import WhatsAppMockup from "./WhatsAppMockup";

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
                BETA &bull; Bekleme Listesi Açıldı
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.1rem] font-bold leading-[1.08] mb-5 tracking-tight">
              Second Brain Beta{" "}
              <span style={{ color: "#00ff9d" }}>Bekleme&nbsp;Listesi</span>{" "}
              Açıldı!&nbsp;🧠
            </h1>

            <p className="text-lg text-white/45 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              WhatsApp&apos;ı ikinci beynine dönüştür — unutma zahmetini
              AI&apos;ya bırak.{" "}
              <span className="text-white/65">
                Türkiye&apos;nin ilk AI hafıza asistanı
              </span>{" "}
              beta&apos;ya öncelikli katıl!
            </p>

            <motion.a
              href="#waitlist"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-3 px-8 py-4 text-black font-bold text-base rounded-2xl"
              style={{
                background: "#00ff9d",
                boxShadow: "0 0 35px rgba(0,255,157,0.32)",
              }}
            >
              Bekleme Listesine Katıl – Ücretsiz Beta Önceliği
              <ArrowDown className="w-5 h-5" />
            </motion.a>

            <p className="text-sm text-white/28 mt-4">
              İlk 500 kişi özel davetiye alacak — numaranı bırak, seni
              ekleyelim!
            </p>

            {/* Social proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start mt-8">
              <div className="flex -space-x-2">
                {["#00ff9d", "#00d4ff", "#a78bfa", "#fb923c"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2"
                    style={{
                      background: `${c}30`,
                      borderColor: `${c}90`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm text-white/35">
                <span style={{ color: "#00ff9d" }} className="font-semibold">
                  247+
                </span>{" "}
                kişi zaten listede
              </p>
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
