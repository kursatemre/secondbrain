import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası — Second Brain",
  description: "Second Brain gizlilik politikası ve kişisel veri işleme prensipleri.",
};

export default function GizlilikPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#0f1117" }}>
      {/* Top bar */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
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
          <span className="text-white/40 text-sm">Gizlilik Politikası</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
          Gizlilik Politikası
        </h1>
        <p className="text-white/35 text-sm mb-12">
          Son güncelleme: Mart 2025
        </p>

        <div className="space-y-10 text-white/60 text-[15px] leading-relaxed">
          <Section title="1. Veri Sorumlusu">
            <p>
              Bu gizlilik politikası, <strong className="text-white/80">Second Brain</strong> uygulamasını geliştiren{" "}
              <strong className="text-white/80">OrionSoft</strong> (İzmir, Türkiye) tarafından hazırlanmıştır.
              Kişisel verilerle ilgili sorularınız için{" "}
              <a
                href="mailto:merhaba@secondbrain.com.tr"
                className="text-[#00ff9d] hover:underline"
              >
                merhaba@secondbrain.com.tr
              </a>{" "}
              adresine yazabilirsiniz.
            </p>
          </Section>

          <Section title="2. Topladığımız Veriler">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white/80">Ad Soyad</strong> — bekleme listesine kayıt sırasında.
              </li>
              <li>
                <strong className="text-white/80">WhatsApp numarası</strong> — beta davetiyesi göndermek amacıyla.
              </li>
              <li>
                <strong className="text-white/80">E-posta adresi</strong> — isteğe bağlı, yalnızca ek bildirimler için.
              </li>
              <li>
                <strong className="text-white/80">Second Brain&apos;e gönderilen içerikler</strong> (aktif kullanımda) —
                notlar, linkler, sesli mesajlar. Kişisel WhatsApp sohbetlerinize erişilmez.
              </li>
            </ul>
          </Section>

          <Section title="3. Verilerinizi Nasıl Kullanıyoruz">
            <ul className="list-disc pl-5 space-y-2">
              <li>Beta davetiyesi göndermek.</li>
              <li>Uygulama içinde yapay zeka hafıza özelliklerini çalıştırmak.</li>
              <li>Hizmet kalitesini iyileştirmek (anonim kullanım istatistikleri).</li>
            </ul>
            <p className="mt-3">
              Verileriniz hiçbir koşulda reklam amaçlı kullanılmaz, üçüncü taraf
              pazarlama şirketleriyle paylaşılmaz.
            </p>
          </Section>

          <Section title="4. Veri Paylaşımı">
            <p>
              Kişisel verilerinizi herhangi bir üçüncü tarafla satmıyoruz. Yalnızca
              hizmetin teknik altyapısını sağlayan tedarikçilerle (sunucu, veritabanı)
              zorunlu ölçüde paylaşılır; bu tedarikçiler verilerinizi kendi amaçları
              için kullanamaz.
            </p>
          </Section>

          <Section title="5. Güvenlik">
            <p>
              Tüm veriler TLS şifreli bağlantılar üzerinden iletilir ve şifreli
              biçimde depolanır. Yetkisiz erişime karşı teknik ve idari önlemler
              alınmaktadır.
            </p>
          </Section>

          <Section title="6. Verilerinizin Saklanma Süresi">
            <p>
              Bekleme listesi verileri beta lansmanından sonra en fazla 12 ay
              saklanır. Aktif kullanıcı verileri, hesabın silinmesiyle birlikte 30
              gün içinde kalıcı olarak kaldırılır.
            </p>
          </Section>

          <Section title="7. Haklarınız">
            <ul className="list-disc pl-5 space-y-2">
              <li>Kişisel verilerinize erişim talep etme.</li>
              <li>Hatalı verilerin düzeltilmesini isteme.</li>
              <li>Verilerinizin silinmesini talep etme.</li>
              <li>İşlemeye itiraz etme.</li>
            </ul>
            <p className="mt-3">
              Bu haklarınızı kullanmak için{" "}
              <a
                href="mailto:merhaba@secondbrain.com.tr"
                className="text-[#00ff9d] hover:underline"
              >
                merhaba@secondbrain.com.tr
              </a>{" "}
              adresine e-posta gönderebilirsiniz. Talebiniz 30 gün içinde
              yanıtlanır.
            </p>
          </Section>

          <Section title="8. Değişiklikler">
            <p>
              Bu politika zaman zaman güncellenebilir. Önemli değişiklikler
              e-posta veya WhatsApp üzerinden bildirilir.
            </p>
          </Section>
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}
