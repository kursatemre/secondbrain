"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MessageCircleOff, Trash2, Lock } from "lucide-react";

const pillars = [
  {
    icon: MessageCircleOff,
    title: "Kişisel Sohbetlerine Dokunmuyoruz",
    description:
      "Second Brain yalnızca kendi numarasına gönderdiğin mesajları okur. Aile grupların, arkadaş yazışmaların tamamen dışındadır.",
    color: "#00ff9d",
  },
  {
    icon: ShieldCheck,
    title: "Numaran Sadece Beta İçin",
    description:
      "WhatsApp numaranı yalnızca beta davetiyesi göndermek için kullanırız. Reklam, pazarlama veya 3. taraf paylaşımı yapılmaz.",
    color: "#00d4ff",
  },
  {
    icon: Lock,
    title: "KVKK Uyumlu",
    description:
      "Verilerini Türkiye'deki veri koruma mevzuatına uygun şekilde işliyoruz. Kişisel bilgilerin şifreli kanallar üzerinden taşınır.",
    color: "#a78bfa",
  },
  {
    icon: Trash2,
    title: "Dilediğinde Sil",
    description:
      "İstediğin zaman \"verilerimi sil\" diyerek tüm kayıtlarını anında kaldırabilirsin. Hiçbir veri kalıcı olarak tutulmaz.",
    color: "#fb923c",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function TrustSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Subtle glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,255,157,0.03) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono text-[#00ff9d] uppercase tracking-[0.2em] mb-4 block">
            Gizlilik & Güvenlik
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-4">
            Verilerini{" "}
            <span style={{ color: "#00ff9d" }}>Güvende Tutuyoruz</span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Numaranı bırakmadan önce bilmen gerekenler — şeffaf olmak
            bizim için bir tercih değil, zorunluluk.
          </p>
        </motion.div>

        {/* Pillars */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {pillars.map((p) => (
            <motion.div
              key={p.title}
              variants={itemVariants}
              className="group relative bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{
                  background: `${p.color}12`,
                  border: `1px solid ${p.color}25`,
                }}
              >
                <p.icon className="w-5 h-5" style={{ color: p.color }} />
              </div>

              <h3 className="font-heading text-base font-bold text-white mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {p.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-xs text-white/20 mt-10"
        >
          Gizlilik Politikamızı ve KVKK Aydınlatma Metnini footer&apos;dan
          inceleyebilirsin.
        </motion.p>
      </div>
    </section>
  );
}
