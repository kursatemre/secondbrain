"use client";

import { motion } from "framer-motion";
import { Brain, ArrowDown } from "lucide-react";

const SVG_W = 800;
const SVG_H = 460;
const BRAIN_X = 400;
const BRAIN_Y = 225;

const BUBBLES = [
  { text: "Hatırla o linki 🔗", cx: 118, cy: 98 },
  { text: "Sesli not özeti 🎙️", cx: 676, cy: 82 },
  { text: "Fatura detayları 🧾", cx: 105, cy: 378 },
  { text: "Yarın toplantı var 📅", cx: 682, cy: 362 },
] as const;

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-12 overflow-hidden"
      style={{ backgroundColor: "#0f1117" }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-25" />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,255,157,0.07) 0%, transparent 68%)",
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[280px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* DESKTOP: Neural network (sm+) */}
      <div
        className="relative w-full max-w-4xl mx-auto hidden sm:block"
        style={{ height: `${SVG_H}px` }}
      >
        {/* SVG: lines, glow, packets */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="rg-brain" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00ff9d" stopOpacity="0" />
            </radialGradient>
            <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Brain ambient glow */}
          <motion.circle
            cx={BRAIN_X}
            cy={BRAIN_Y}
            r={75}
            fill="url(#rg-brain)"
            animate={{ r: [65, 88, 65], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle
            cx={BRAIN_X}
            cy={BRAIN_Y}
            r={50}
            fill="none"
            stroke="#00ff9d"
            strokeWidth="0.5"
            strokeOpacity="0.18"
            animate={{ r: [44, 58, 44] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Neural connection lines */}
          {BUBBLES.map((b, i) => (
            <motion.path
              key={`line-${i}`}
              d={`M ${BRAIN_X} ${BRAIN_Y} L ${b.cx} ${b.cy}`}
              stroke={i % 2 === 0 ? "#00ff9d" : "#00d4ff"}
              strokeWidth="1"
              strokeOpacity="0.22"
              strokeDasharray="5 4"
              fill="none"
              animate={{ strokeDashoffset: [0, -9] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.22,
              }}
            />
          ))}

          {/* Travelling data packets */}
          {BUBBLES.map((b, i) => (
            <motion.circle
              key={`pkt-${i}`}
              r="2.5"
              fill={i % 2 === 0 ? "#00ff9d" : "#00d4ff"}
              filter="url(#f-glow)"
              animate={{
                cx: [BRAIN_X, b.cx, BRAIN_X],
                cy: [BRAIN_Y, b.cy, BRAIN_Y],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: i * 0.55,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Bubble connector dots */}
          {BUBBLES.map((b, i) => (
            <motion.circle
              key={`dot-${i}`}
              cx={b.cx}
              cy={b.cy}
              r="3"
              fill={i % 2 === 0 ? "#00ff9d" : "#00d4ff"}
              animate={{ r: [2.2, 4.2, 2.2], fillOpacity: [0.3, 0.75, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.38 }}
            />
          ))}
        </svg>

        {/* Brain icon */}
        <motion.div
          className="absolute z-10"
          style={{
            left: `${(BRAIN_X / SVG_W) * 100}%`,
            top: `${(BRAIN_Y / SVG_H) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{ background: "rgba(0,255,157,0.09)" }}
            />
            <div className="absolute w-36 h-36 rounded-full border border-[#00ff9d]/10" />
            <div className="absolute w-44 h-44 rounded-full border border-[#00ff9d]/5" />
            <Brain
              className="w-16 h-16 text-[#00ff9d] relative z-10"
              style={{ filter: "drop-shadow(0 0 20px rgba(0,255,157,0.8))" }}
            />
          </div>
        </motion.div>

        {/* Chat bubbles */}
        {BUBBLES.map((b, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute z-10"
            style={{
              left: `${(b.cx / SVG_W) * 100}%`,
              top: `${(b.cy / SVG_H) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, i % 2 === 0 ? -8 : -5, 0],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.7 + i * 0.18 },
              scale: { duration: 0.5, delay: 0.7 + i * 0.18 },
              y: {
                duration: 3.2 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.65,
              },
            }}
          >
            <div
              className="px-3.5 py-2 rounded-2xl text-xs font-medium text-white/80 whitespace-nowrap backdrop-blur-sm"
              style={{
                background: "rgba(18, 24, 42, 0.88)",
                border: `1px solid ${
                  i % 2 === 0
                    ? "rgba(0,255,157,0.22)"
                    : "rgba(0,212,255,0.22)"
                }`,
                boxShadow: `0 0 22px ${
                  i % 2 === 0
                    ? "rgba(0,255,157,0.07)"
                    : "rgba(0,212,255,0.07)"
                }`,
              }}
            >
              {b.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* MOBILE: simplified brain + 2×2 grid */}
      <div className="sm:hidden flex flex-col items-center gap-5 mb-10 w-full px-5">
        <motion.div
          className="relative w-24 h-24 flex items-center justify-center"
          animate={{ scale: [1, 1.09, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(0,255,157,0.08)" }}
          />
          <Brain
            className="w-14 h-14 text-[#00ff9d] relative z-10"
            style={{ filter: "drop-shadow(0 0 16px rgba(0,255,157,0.75))" }}
          />
        </motion.div>
        <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
          {BUBBLES.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="rounded-xl px-3 py-2.5 text-xs text-white/65 font-medium"
              style={{
                background: "rgba(18, 24, 42, 0.8)",
                border: "1px solid rgba(0,255,157,0.14)",
              }}
            >
              {b.text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative z-10 text-center max-w-3xl mx-auto px-5 pb-4"
      >
        {/* Live badge */}
        <div className="flex justify-center mb-6">
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

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.07] mb-5 tracking-tight">
          Second Brain Beta{" "}
          <span style={{ color: "#00ff9d" }}>Bekleme Listesi</span> Açıldı! 🧠
        </h1>

        <p className="text-lg text-white/45 mb-10 max-w-2xl mx-auto leading-relaxed">
          WhatsApp&apos;ı ikinci beynine dönüştür — unutma zahmetini AI&apos;ya
          bırak.{" "}
          <span className="text-white/65">
            Türkiye&apos;nin ilk AI hafıza asistanı
          </span>{" "}
          beta&apos;ya öncelikli katıl!
        </p>

        <motion.a
          href="#waitlist"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-3 px-8 py-4 text-black font-bold text-base rounded-2xl transition-all"
          style={{
            background: "#00ff9d",
            boxShadow: "0 0 35px rgba(0,255,157,0.32)",
          }}
        >
          Bekleme Listesine Katıl – Ücretsiz Beta Önceliği
          <ArrowDown className="w-5 h-5" />
        </motion.a>

        <p className="text-sm text-white/28 mt-4">
          İlk 500 kişi özel davetiye alacak – numaranı bırak, seni ekleyelim!
        </p>
      </motion.div>

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
