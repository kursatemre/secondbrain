import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata = {
  title: "KVKK Aydınlatma Metni — Second Brain",
  description: "6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KVKKPage() {
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
          <span className="text-white/40 text-sm">KVKK Aydınlatma Metni</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
          KVKK Aydınlatma Metni
        </h1>
        <p className="text-white/35 text-sm mb-2">
          6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında
        </p>
        <p className="text-white/35 text-sm mb-12">Son güncelleme: Mart 2025</p>

        <div className="space-y-10 text-white/60 text-[15px] leading-relaxed">
          <Section title="Veri Sorumlusu">
            <p>
              Kişisel verileriniz, veri sorumlusu sıfatıyla{" "}
              <strong className="text-white/80">OrionSoft</strong> (İzmir, Türkiye)
              tarafından aşağıda açıklanan kapsamda işlenmektedir.
            </p>
            <div
              className="mt-4 p-4 rounded-xl text-sm space-y-1"
              style={{
                background: "rgba(0,255,157,0.04)",
                border: "1px solid rgba(0,255,157,0.1)",
              }}
            >
              <p><span className="text-white/40">Ticari Unvan:</span> <span className="text-white/70">OrionSoft</span></p>
              <p><span className="text-white/40">Adres:</span> <span className="text-white/70">İzmir, Türkiye</span></p>
              <p>
                <span className="text-white/40">E-posta:</span>{" "}
                <a href="mailto:merhaba@secondbrain.com.tr" className="text-[#00ff9d] hover:underline">
                  merhaba@secondbrain.com.tr
                </a>
              </p>
            </div>
          </Section>

          <Section title="İşlenen Kişisel Veriler">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/30 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <th className="pb-2 pr-4 font-medium">Veri Kategorisi</th>
                  <th className="pb-2 font-medium">Örnekler</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {[
                  ["Kimlik", "Ad, soyad"],
                  ["İletişim", "WhatsApp numarası, e-posta adresi"],
                  ["Kullanım İçeriği", "Second Brain'e gönderilen notlar, linkler, sesli mesajlar"],
                ].map(([cat, ex]) => (
                  <tr key={cat}>
                    <td className="py-2.5 pr-4 text-white/70">{cat}</td>
                    <td className="py-2.5 text-white/45">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Kişisel Verilerin İşlenme Amaçları">
            <ul className="list-disc pl-5 space-y-2">
              <li>Beta bekleme listesini yönetmek ve davetiye göndermek.</li>
              <li>Yapay zeka hafıza hizmetini sunmak ve geliştirmek.</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
              <li>Kullanıcı taleplerinin karşılanması.</li>
            </ul>
          </Section>

          <Section title="Hukuki İşleme Dayanakları (KVKK m.5)">
            <ul className="list-disc pl-5 space-y-2">
              <li>Açık rıza (bekleme listesi kaydı).</li>
              <li>Sözleşmenin kurulması veya ifası (aktif kullanım).</li>
              <li>Meşru menfaat (anonim hizmet iyileştirme istatistikleri).</li>
            </ul>
          </Section>

          <Section title="Kişisel Verilerin Aktarımı">
            <p>
              Kişisel verileriniz yurt içi teknik altyapı sağlayıcılarına (sunucu,
              veritabanı hizmetleri) yalnızca hizmetin ifası için aktarılabilir.
              Bu aktarımlar KVKK&apos;nın 8. maddesi kapsamında gerçekleştirilir.
              Verileriniz hiçbir koşulda reklam veya pazarlama amacıyla üçüncü
              taraflara satılmaz veya devredilmez.
            </p>
          </Section>

          <Section title="Veri Saklama Süreleri">
            <ul className="list-disc pl-5 space-y-2">
              <li>Bekleme listesi verileri: Beta lansmanından itibaren en fazla 12 ay.</li>
              <li>Aktif kullanıcı verileri: Hesap silinmesinden itibaren 30 gün.</li>
              <li>Yasal zorunluluk gerektiren veriler: İlgili mevzuatta belirtilen süreler.</li>
            </ul>
          </Section>

          <Section title="KVKK Kapsamındaki Haklarınız (m.11)">
            <p className="mb-3">Kişisel verilerinize ilişkin olarak:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
              <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme,</li>
              <li>Silinmesini veya yok edilmesini isteme,</li>
              <li>İşlemeye itiraz etme,</li>
              <li>Zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <p className="mt-3">haklarına sahipsiniz.</p>
          </Section>

          <Section title="Başvuru Yöntemi">
            <p>
              Haklarınızı kullanmak için{" "}
              <a
                href="mailto:merhaba@secondbrain.com.tr"
                className="text-[#00ff9d] hover:underline"
              >
                merhaba@secondbrain.com.tr
              </a>{" "}
              adresine kimliğinizi doğrulayan bilgilerle birlikte yazılı başvuruda
              bulunabilirsiniz. Başvurunuz en geç <strong className="text-white/80">30 gün</strong> içinde
              yanıtlanır. Başvurunun reddedilmesi veya yanıtsız kalması durumunda
              Kişisel Verileri Koruma Kurulu&apos;na şikâyette bulunma hakkınız
              saklıdır.
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
