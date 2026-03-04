"use client";

import { motion } from "framer-motion";
import { Save, Brain, Search, MessageSquare } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/15558587000";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const steps = [
  {
    number: "01",
    icon: Save,
    title: "Gönder",
    description: "WhatsApp'ta Second Brain'e link, sesli not, fatura veya fotoğraf at. Başka hiçbir uygulama açmana gerek yok.",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analiz Eder",
    description: "Second Brain içeriği okur, özetler ve otomatik etiketler. Sen sadece gönderirsin, gerisini AI halleder.",
  },
  {
    number: "03",
    icon: Search,
    title: "Sor & Bul",
    description: '"Geçen ay kaydettiğim finans linkini bul" veya "Dünkü faturada ne yazıyordu?" diye sor — saniyeler içinde cevap gelir.',
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Bağlantı Kurar",
    description: "Farklı zamanlarda kaydettiğin notları birbirine bağlar. Karar verirken geçmiş bağlamı hatırlatır.",
  },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.14 } } };
const itemVariants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };

export default function ProcessSection() {
  return (
    <section id="process" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF9D]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="text-center mb-20">
          <span className="text-xs font-mono text-[#00FF9D] uppercase tracking-[0.2em] mb-4 block">Nasıl Çalışır?</span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold">
            4 Adımda <span className="text-[#00FF9D]">Çalışma Mantığı</span>
          </h2>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          <div className="absolute top-[2.6rem] left-[15%] right-[15%] h-px hidden lg:block overflow-hidden">
            <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }} style={{ transformOrigin: "left" }} className="h-full bg-gradient-to-r from-[#00FF9D]/30 via-[#00FF9D]/15 to-[#00FF9D]/30" />
          </div>

          {steps.map((step, index) => (
            <motion.div key={step.number} variants={itemVariants} className="group relative">
              <div className="h-full bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-6 transition-all duration-300 hover:border-[#00FF9D]/20 hover:bg-[#0F0F0F]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative w-11 h-11 rounded-xl bg-[#00FF9D]/8 border border-[#00FF9D]/20 flex items-center justify-center group-hover:bg-[#00FF9D]/14 transition-colors flex-shrink-0">
                    <step.icon className="w-5 h-5 text-[#00FF9D]" />
                  </div>
                  <span className="font-mono text-xs text-[#00FF9D]/40 font-bold tracking-widest">{step.number}</span>
                </div>
                <h3 className="font-heading text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.description}</p>
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

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mt-14">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#00FF9D] text-black font-bold text-sm rounded-xl hover:bg-[#00FF9D]/90 transition-all hover:shadow-[0_0_25px_rgba(0,255,157,0.3)]">
            <WhatsAppIcon />
            Hemen Dene — Ücretsiz Başla
          </a>
        </motion.div>
      </div>
    </section>
  );
}
