import { Brain } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-white/5 py-8"
      style={{ backgroundColor: "#0f1117" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(0,255,157,0.08)",
                border: "1px solid rgba(0,255,157,0.18)",
              }}
            >
              <Brain className="w-3.5 h-3.5 text-[#00ff9d]" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm block leading-tight">
                Second Brain
              </span>
              <a
                href="https://secondbrain.com.tr"
                className="text-[10px] font-mono transition-colors hover:text-[#00ff9d]/70"
                style={{ color: "rgba(0,255,157,0.4)" }}
              >
                secondbrain.com.tr
              </a>
            </div>
          </div>

          {/* Center: developer credit */}
          <p className="text-xs text-center text-white/20">
            <a
              href="https://orionsoft.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/45 transition-colors"
            >
              OrionSoft
            </a>{" "}
            tarafından geliştirildi &bull; İzmir
          </p>

          {/* Right: links */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-xs text-white/20 hover:text-white/45 transition-colors"
            >
              Gizlilik Politikası
            </a>
            <a
              href="#"
              className="text-xs text-white/20 hover:text-white/45 transition-colors"
            >
              KVKK
            </a>
            <a
              href="mailto:merhaba@secondbrain.com.tr"
              className="text-xs text-white/20 hover:text-white/45 transition-colors"
            >
              İletişim
            </a>
            <span className="text-[11px] text-white/14">&copy; {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
