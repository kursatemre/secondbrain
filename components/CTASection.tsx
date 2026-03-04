"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/15558587000";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF9D]/20 to-transparent" />

      {/* Radial mint glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#00FF9D]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-xs font-mono text-[#00FF9D] uppercase tracking-[0.2em] mb-6 block">
            Hemen Başla
          </span>

          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.04] tracking-tight">
            Unutmanın{" "}
            <span className="text-[#00FF9D]">sonu</span>
            {" "}geldi.
          </h2>

          <p className="text-lg text-white/40 mb-12 max-w-xl mx-auto leading-relaxed">
            İkinci beynin WhatsApp&apos;ta seni bekliyor. Kurulum yok, uygulama
            indirme yok. Sadece bir mesaj at.
          </p>

          {/* Main CTA */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 px-10 py-5 bg-[#00FF9D] text-black font-bold text-lg rounded-2xl hover:bg-[#00FF9D]/94 transition-all shadow-[0_0_40px_rgba(0,255,157,0.25)] hover:shadow-[0_0_70px_rgba(0,255,157,0.45)]"
            >
              <WhatsAppIcon />
              WhatsApp&apos;ta Hemen Dene
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </a>
          </motion.div>

          <p className="text-sm text-white/22 mt-6">
            Ücretsiz başla · Kredi kartı gerekmez · İstediğin zaman iptal et
          </p>
        </motion.div>
      </div>
    </section>
  );
}
