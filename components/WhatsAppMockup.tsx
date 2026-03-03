"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Mic, Link as LinkIcon } from "lucide-react";

type ChatMessage = {
  id: number;
  type: "user" | "bot";
  content: string;
  isLink?: boolean;
  time: string;
};

const chatMessages: ChatMessage[] = [
  {
    id: 1,
    type: "user",
    content: "https://youtube.com/watch?v=xvFZjo5PgG0",
    isLink: true,
    time: "14:31",
  },
  {
    id: 2,
    type: "bot",
    content:
      "🔗 *Link Özeti*\n\n*MIT: Makine Öğrenmesi*\n✦ Gradient Descent dersi\n✦ Optimizasyon & kayıp fonks.\n✦ Süre: 52 dakika\n\n🏷️ #ML #MIT #öğrenme",
    time: "14:32",
  },
  {
    id: 3,
    type: "user",
    content: "sesli notumu hatırlat",
    time: "14:35",
  },
  {
    id: 4,
    type: "bot",
    content:
      "🎙️ *Sesli Not* — Bugün 09:47\n\n\"Proje fikirleri: mikro SaaS modeli, Türkiye pazarı odaklı WhatsApp botu...\"\n\n⏱️ 1 dk 23 sn",
    time: "14:35",
  },
];

const WAVEFORM_HEIGHTS = [4, 8, 12, 6, 16, 10, 14, 8, 6, 12, 4, 10, 14, 7, 11];

export default function WhatsAppMockup() {
  const [visible, setVisible] = useState<number[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let mounted = true;

    const add = (delay: number, fn: () => void) => {
      timeouts.push(setTimeout(() => { if (mounted) fn(); }, delay));
    };

    const runSequence = () => {
      if (!mounted) return;
      setVisible([]);
      setTyping(false);

      add(600, () => setVisible([1]));
      add(1400, () => setTyping(true));
      add(3000, () => { setTyping(false); setVisible([1, 2]); });
      add(4400, () => setVisible([1, 2, 3]));
      add(5200, () => setTyping(true));
      add(6600, () => { setTyping(false); setVisible([1, 2, 3, 4]); });
      add(10000, () => {
        timeouts.forEach(clearTimeout);
        timeouts.length = 0;
        runSequence();
      });
    };

    runSequence();

    return () => {
      mounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const displayed = chatMessages.filter((m) => visible.includes(m.id));

  return (
    <div className="relative flex justify-center items-center">
      {/* Ambient glow behind phone */}
      <div className="absolute w-72 h-[500px] bg-[#00FF9D]/6 blur-[80px] rounded-full pointer-events-none" />

      {/* Floating phone */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[300px]"
      >
        {/* Phone shell */}
        <div className="bg-gradient-to-b from-[#222] to-[#111] rounded-[3.2rem] p-[10px] shadow-2xl border border-white/10">
          {/* Screen */}
          <div className="bg-[#0B141A] rounded-[2.6rem] overflow-hidden">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-3 pb-1">
              <span className="text-[10px] text-white/50 font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-[#00FF9D]/70 rounded-sm" />
                <div className="w-1 h-2 bg-white/20 rounded-sm" />
              </div>
            </div>

            {/* WhatsApp header */}
            <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center gap-2.5 border-b border-white/5">
              <div className="w-9 h-9 rounded-full bg-[#00FF9D]/15 border-2 border-[#00FF9D]/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-black text-[#00FF9D]">SB</span>
              </div>
              <div>
                <p className="text-white text-[13px] font-semibold leading-tight">
                  Second Brain
                </p>
                <p className="text-[#00FF9D] text-[10px]">çevrimiçi</p>
              </div>
            </div>

            {/* Chat area */}
            <div
              className="h-[360px] p-3 flex flex-col justify-end gap-1.5 overflow-hidden"
              style={{ backgroundColor: "#0B141A" }}
            >
              {/* Waveform decoration at top */}
              <div className="flex items-end gap-0.5 h-6 mb-2 opacity-20">
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-[#00FF9D] rounded-sm"
                    style={{ height: `${h * 1.5}px` }}
                    animate={{ height: [`${h * 1.5}px`, `${h * 2.5}px`, `${h * 1.5}px`] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: i * 0.07,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="popLayout">
                {displayed.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{
                      opacity: 0,
                      x: msg.type === "user" ? 20 : -20,
                      scale: 0.92,
                    }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex ${
                      msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
                        msg.type === "user"
                          ? "bg-[#005C4B] text-white rounded-br-sm"
                          : "bg-[#202C33] text-white/90 rounded-bl-sm"
                      }`}
                    >
                      {msg.isLink ? (
                        <div className="flex items-center gap-1.5">
                          <LinkIcon className="w-3 h-3 text-[#00FF9D] flex-shrink-0" />
                          <span className="text-[#00FF9D] text-[10px] truncate max-w-[160px]">
                            {msg.content}
                          </span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-line text-[10.5px]">
                          {msg.content}
                        </p>
                      )}
                      <div
                        className={`flex items-center gap-0.5 mt-0.5 ${
                          msg.type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span className="text-[9px] text-white/35">
                          {msg.time}
                        </span>
                        {msg.type === "user" && (
                          <CheckCheck className="w-3 h-3 text-[#00FF9D]" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, scale: 0.85, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#202C33] rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]/60"
                          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            delay: i * 0.18,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input bar */}
            <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center gap-2">
              <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5">
                <span className="text-[10px] text-white/25">Mesaj yaz...</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center flex-shrink-0">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Home bar */}
            <div className="flex justify-center py-2.5">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Ring decorations */}
        <div className="absolute -inset-3 border border-[#00FF9D]/8 rounded-[4rem] pointer-events-none" />
        <div className="absolute -inset-6 border border-[#00FF9D]/4 rounded-[5rem] pointer-events-none" />
      </motion.div>
    </div>
  );
}
