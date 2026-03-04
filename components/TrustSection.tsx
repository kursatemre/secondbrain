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


        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#00FF9D] text-black font-bold text-sm rounded-xl hover:bg-[#00FF9D]/90 transition-all hover:shadow-[0_0_25px_rgba(0,255,157,0.3)]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Güvenli Başla — Ücretsiz
          </a>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-14"
        >
          <a
            href="https://wa.me/15558587000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#00FF9D] text-black font-bold text-sm rounded-xl hover:bg-[#00FF9D]/90 transition-all hover:shadow-[0_0_25px_rgba(0,255,157,0.3)]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Güvenli Başla — Ücretsiz
          </a>
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
