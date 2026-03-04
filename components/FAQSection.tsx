"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Yazdıklarımı başkası görebilir mi?",
    a: "Hayır. Second Brain'e gönderdiğin mesajlar yalnızca sana aittir. Hiçbir çalışanımız, ortak ya da üçüncü taraf bu içeriklere erişemez. Verilerini yalnızca yapay zekanın sana cevap verebilmesi için işliyoruz; başka bir amaçla kullanılmaz.",
  },
  {
    q: "WhatsApp sohbetlerimi okuyabilir misiniz?",
    a: "Kesinlikle hayır. Second Brain sadece kendi numarasına —yani bota— gönderilen mesajları görür. Aile grubun, arkadaş yazışmaların veya diğer sohbetlerin içeriğine hiçbir şekilde erişimimiz yoktur ve olamaz; WhatsApp'ın uçtan uca şifreleme altyapısı buna izin vermez.",
  },
  {
    q: "Verilerim ne kadar güvende?",
    a: "Tüm veriler şifreli kanallar (TLS) üzerinden iletilir ve şifreli biçimde depolanır. Türkiye'deki KVKK mevzuatına tam uyum sağlıyoruz. Verilerini üçüncü taraf reklam ağlarıyla, veri brokerleriyle veya herhangi bir başka şirketle paylaşmıyoruz.",
  },
  {
    q: "Numaramı neden istiyorsunuz?",
    a: "Second Brain tamamen WhatsApp üzerinden çalışır. Second Brain tamamen WhatsApp üzerinden çalışır. Numaranı yalnızca botun seninle iletişim kurabilmesi için kullanırız. Numaran hiçbir zaman pazarlama listelerine eklenmez veya üçüncü taraflarla paylaşılmaz.",
  },
  {
    q: "Verilerimi silmek istersem ne yapabilirim?",
    a: "Second Brain'e \"verilerimi sil\" yazman yeterli. 48 saat içinde tüm kayıtların kalıcı olarak kaldırılır ve bunu e-posta ile doğrularız. Veri silme hakkın KVKK kapsamında güvence altındadır.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono text-[#00ff9d] uppercase tracking-[0.2em] mb-4 block">
            Merak Edilenler
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold">
            Sık Sorulan{" "}
            <span style={{ color: "#00ff9d" }}>Sorular</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-colors duration-200"
                style={{
                  background: isOpen
                    ? "rgba(0,255,157,0.04)"
                    : "rgba(13,13,13,1)",
                  border: isOpen
                    ? "1px solid rgba(0,255,157,0.18)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-heading font-semibold text-white text-base leading-snug">
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: isOpen
                        ? "rgba(0,255,157,0.15)"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {isOpen ? (
                      <Minus className="w-3.5 h-3.5 text-[#00ff9d]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-white/50 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#00FF9D] text-black font-bold text-sm rounded-xl hover:bg-[#00FF9D]/90 transition-all hover:shadow-[0_0_25px_rgba(0,255,157,0.3)]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            Hemen Başla
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
            Hemen Başla
          </a>
        </motion.div>
      </div>
    </section>
  );
}
