"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import WhatsAppMockup from "./WhatsAppMockup";

const WHATSAPP_URL = "https://wa.me/905xxxxxxxxx";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-100" />
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-[#00FF9D]/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-[#00FF9D]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* Left: Copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00FF9D]/20 bg-[#00FF9D]/5 text-xs text-[#00FF9D] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Türkiye&apos;nin AI Hafıza Asistanı
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-heading text-5xl sm:text-6xl xl:text-7xl font-bold leading-[1.04] mb-6 tracking-tight"
            >
              WhatsApp&apos;ı{" "}
              <span className="text-[#00FF9D]">İkinci Beynine</span>{" "}
              Dönüştür
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              className="text-lg text-white/45 max-w-lg mb-10 leading-relaxed"
            >
              Sesli not, link, fatura, reçete — ne kaydedersen kaydet.{" "}
              <span className="text-white/70">
                Yapay zeka özetler, depolar ve geri çağırır.
              </span>{" "}
              Ayrı bir uygulama yok.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2.5 px-6 py-4 bg-[#00FF9D] text-black font-bold rounded-xl hover:bg-[#00FF9D]/92 transition-all hover:shadow-[0_0_35px_rgba(0,255,157,0.4)] text-sm"
              >
                <WhatsAppIcon />
                WhatsApp&apos;ta Hemen Dene
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#process"
                className="flex items-center justify-center gap-2 px-6 py-4 border border-white/10 text-white/60 rounded-xl hover:border-white/20 hover:text-white transition-all text-sm"
              >
                Nasıl Çalışır?
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {[
                  "from-emerald-400/40 to-emerald-600/20",
                  "from-teal-400/40 to-teal-600/20",
                  "from-green-400/40 to-green-600/20",
                  "from-cyan-400/40 to-cyan-600/20",
                ].map((gradient, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-black`}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm text-white/50">
                  <span className="text-white font-semibold">500+</span> kullanıcı
                  hafızasını devretti
                </p>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3 h-3 text-[#00FF9D]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <WhatsAppMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
