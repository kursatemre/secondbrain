"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/905xxxxxxxxx";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const plans = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "sonsuza kadar",
    description: "Deneyimlemek için mükemmel başlangıç.",
    cta: "Hemen Başla",
    isPrimary: false,
    features: [
      "10 mesaj / ay",
      "Link özetleme",
      "Sesli not transkripti",
      "Temel semantik arama",
    ],
    unavailable: ["Görsel analiz", "Grup hafızası", "Öncelikli destek"],
  },
  {
    name: "Premium",
    price: "₺150",
    period: "/ ay",
    description: "Gerçek bir ikinci beyin için sınırsız güç.",
    cta: "WhatsApp'ta Başla",
    isPrimary: true,
    badge: "En Popüler",
    features: [
      "Sınırsız mesaj",
      "Sınırsız link özetleme",
      "Sınırsız sesli not",
      "Görsel analiz (fatura, reçete)",
      "Gelişmiş semantik arama",
      "Bağlamsal sorular",
      "Öncelikli destek",
    ],
  },
] as const;

export default function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00FF9D]/20 to-transparent" />

      {/* Subtle radial bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#00FF9D]/2 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono text-[#00FF9D] uppercase tracking-[0.2em] mb-4 block">
            Fiyatlar
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-3">
            Sade ve <span className="text-[#00FF9D]">Şeffaf</span>
          </h2>
          <p className="text-white/35 text-base">
            Kredi kartı gerekmez · Dilediğin zaman iptal et
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative rounded-2xl p-7 border transition-shadow ${
                plan.isPrimary
                  ? "bg-gradient-to-br from-[#0C1A10] to-[#080808] border-[#00FF9D]/28 shadow-[0_0_50px_rgba(0,255,157,0.07)]"
                  : "bg-[#0D0D0D] border-[#1A1A1A]"
              }`}
            >
              {/* Badge */}
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#00FF9D] text-black text-xs font-bold rounded-full shadow-[0_0_20px_rgba(0,255,157,0.4)]">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan info */}
              <div className="mb-5">
                <p className="text-sm text-white/40 font-medium mb-3">{plan.name}</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="font-heading text-5xl font-bold text-white leading-none">
                    {plan.price}
                  </span>
                  <span className="text-white/35 text-sm pb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-white/35 mt-2">{plan.description}</p>
              </div>

              <div
                className={`h-px mb-5 ${
                  plan.isPrimary ? "bg-[#00FF9D]/18" : "bg-white/5"
                }`}
              />

              {/* Features */}
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.isPrimary
                          ? "bg-[#00FF9D]/10 border border-[#00FF9D]/22"
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          plan.isPrimary ? "text-[#00FF9D]" : "text-white/35"
                        }`}
                      />
                    </div>
                    <span className="text-sm text-white/65">{feature}</span>
                  </li>
                ))}
                {"unavailable" in plan &&
                  plan.unavailable?.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-white/3 border border-white/5">
                        <span className="text-[10px] text-white/15 leading-none">
                          ×
                        </span>
                      </div>
                      <span className="text-sm text-white/22">{item}</span>
                    </li>
                  ))}
              </ul>

              {/* CTA */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  plan.isPrimary
                    ? "bg-[#00FF9D] text-black hover:bg-[#00FF9D]/92 hover:shadow-[0_0_30px_rgba(0,255,157,0.35)]"
                    : "bg-white/5 text-white/60 border border-white/8 hover:bg-white/9 hover:text-white"
                }`}
              >
                {plan.isPrimary && <WhatsAppIcon />}
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-white/20 mt-10"
        >
          Ödeme güvenli iyzico altyapısı ile gerçekleşir. İstediğin zaman
          iptal edebilirsin.
        </motion.p>
      </div>
    </section>
  );
}
