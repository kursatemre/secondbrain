"use client";

import { motion } from "framer-motion";
import { Save, Brain, Search, MessageSquare } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Save,
    title: "Gönder",
    description:
      "WhatsApp'ta Second Brain'e link, sesli not, fatura veya fotoğraf at. Başka hiçbir uygulama açmana gerek yok.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analiz Eder",
    description:
      "Second Brain içeriği okur, özetler ve otomatik etiketler. Sen sadece gönderirsin, gerisini AI halleder.",
  },
  {
    number: "03",
    icon: Search,
    title: "Sor & Bul",
    description:
      "\"Geçen ay kaydettiğim finans linkini bul\" veya \"Dünkü faturada ne yazıyordu?\" diye sor — saniyeler içinde cevap gelir.",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Bağlantı Kurar",
    description:
      "Farklı zamanlarda kaydettiğin notları birbirine bağlar. \"Bunu daha önce konuşmuştuk\" der, karar verirken seni destekler.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function ProcessSection() {
  return (
    <section id="process" className="py-28 relative overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF9D]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-mono text-[#00FF9D] uppercase tracking-[0.2em] mb-4 block">
            Nasıl Çalışır?
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold">
            4 Adımda{" "}
            <span className="text-[#00FF9D]">Çalışma Mantığı</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative"
        >
          {/* Connector line (desktop only) */}
          <div className="absolute top-[2.6rem] left-[15%] right-[15%] h-px hidden lg:block overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
              style={{ transformOrigin: "left" }}
              className="h-full bg-gradient-to-r from-[#00FF9D]/30 via-[#00FF9D]/15 to-[#00FF9D]/30"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="group relative"
            >
              <div className="h-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 transition-all duration-300 hover:border-[#00FF9D]/20 hover:bg-[#0F0F0F]">
                {/* Icon + Number row */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative w-11 h-11 rounded-xl bg-[#00FF9D]/8 border border-[#00FF9D]/20 flex items-center justify-center group-hover:bg-[#00FF9D]/14 transition-colors flex-shrink-0">
                    <step.icon className="w-5 h-5 text-[#00FF9D]" />
                  </div>
                  <span className="font-mono text-xs text-[#00FF9D]/40 font-bold tracking-widest">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Beta badge */}
                <div className="pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono text-[#00FF9D]/55 px-2 py-0.5 border border-[#00FF9D]/15 rounded-full">
                    Beta&apos;da Deneyimle
                  </span>
                </div>

                {/* Arrow for non-last steps */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-2.5 top-[2.6rem] z-10 hidden lg:flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-black border border-[#00FF9D]/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]/40" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
