import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProcessSection from "@/components/ProcessSection";
import FeaturesSection from "@/components/FeaturesSection";
import TrustSection from "@/components/TrustSection";
import FAQSection from "@/components/FAQSection";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#0f1117" }}>
      <Navbar />
      <HeroSection />
      <ProcessSection />
      <FeaturesSection />
      <TrustSection />
      <FAQSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  );
}
