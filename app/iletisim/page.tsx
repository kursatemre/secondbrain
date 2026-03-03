import Link from "next/link";
import { Brain, Mail, Phone, MapPin, Instagram, Linkedin } from "lucide-react";

export const metadata = {
  title: "İletişim — Second Brain",
  description: "Second Brain ile iletişime geçin.",
};

export default function IletisimPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0f1117" }}>
      {/* Top bar */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(0,255,157,0.08)",
                border: "1px solid rgba(0,255,157,0.18)",
              }}
            >
              <Brain className="w-3.5 h-3.5 text-[#00ff9d]" />
            </div>
            <span className="font-heading font-bold text-white text-sm">
              Second Brain
            </span>
          </Link>
          <span className="text-white/20 text-sm">/</span>
          <span className="text-white/40 text-sm">İletişim</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
          İletişim
        </h1>
        <p className="text-white/40 text-base mb-12 max-w-lg">
          Sorularınız, geri bildirimleriniz veya iş birliği teklifleriniz için
          aşağıdaki kanallardan bize ulaşabilirsiniz. 24 saat içinde dönüş
          yapıyoruz.
        </p>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <ContactCard
            icon={Mail}
            label="E-posta"
            value="merhaba@secondbrain.com.tr"
            href="mailto:merhaba@secondbrain.com.tr"
            color="#00ff9d"
          />
          <ContactCard
            icon={Phone}
            label="Telefon / WhatsApp"
            value="+90 545 715 43 05"
            href="https://wa.me/905457154305"
            color="#00d4ff"
          />
          <ContactCard
            icon={MapPin}
            label="Konum"
            value="İzmir, Türkiye"
            href="https://maps.google.com/?q=Izmir,Turkey"
            color="#a78bfa"
          />
          <ContactCard
            icon={Instagram}
            label="Instagram"
            value="@orionsoft.dev"
            href="https://instagram.com/orionsoft.dev"
            color="#fb923c"
          />
        </div>

        {/* Developer info */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(0,255,157,0.03)",
            border: "1px solid rgba(0,255,157,0.1)",
          }}
        >
          <p className="text-xs font-mono text-[#00ff9d]/60 uppercase tracking-widest mb-3">
            Geliştirici
          </p>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="font-heading font-bold text-white text-lg mb-1">
                OrionSoft
              </p>
              <p className="text-white/45 text-sm">
                Kurumsal web sitesi, e-ticaret, özel yazılım ve sosyal medya
                çözümleri — İzmir merkezli dijital ajans.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://orionsoft.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors text-black font-bold"
                style={{ background: "#00ff9d" }}
              >
                orionsoft.dev
              </a>
              <a
                href="https://linkedin.com/in/kürşat-emre-eroğlan-7055241b2/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Linkedin className="w-4 h-4 text-white/50" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link
            href="/"
            className="text-sm text-white/35 hover:text-[#00ff9d] transition-colors"
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
  color: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-start gap-4 p-5 rounded-2xl transition-all duration-200"
      style={{
        background: "rgba(13,13,13,1)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          "rgba(255,255,255,0.06)";
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}25`,
        }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/30 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
          {value}
        </p>
      </div>
    </a>
  );
}
