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
    a: "Second Brain tamamen WhatsApp üzerinden çalışır. Numaranı yalnızca iki amaçla kullanırız: (1) Beta açıldığında sana tek bir davetiye göndermek, (2) Uygulamayı aktif kullanmaya başladığında botun seninle iletişim kurabilmesi için. Numaran hiçbir zaman pazarlama listelerine eklenmez.",
  },
  {
    q: "Verilerimi silmek istersem ne yapabilirim?",
    a: "Beta sürecinde Second Brain'e \"verilerimi sil\" yazman yeterli. 48 saat içinde tüm kayıtların kalıcı olarak kaldırılır ve bunu e-posta ile doğrularız. Veri silme hakkın KVKK kapsamında güvence altındadır.",
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
      </div>
    </section>
  );
}
