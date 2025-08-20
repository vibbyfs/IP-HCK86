import FAQ from "../../components/publics/Faq";
import Footer from "../../components/publics/Footer";
import { HeroSection } from "../../components/publics/HeroSection";
import FeatureSection from "../../components/publics/FeatureSection";
import { HowItWorksSetion } from "../../components/publics/HowItWorksSection";
import { CtaSection } from "../../components/publics/CtaSection";
import { NavbarSection } from "../../components/publics/NavbarSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white text-neutral-800">
      <NavbarSection />
      <HeroSection />
      <div id="features">
        <FeatureSection />
      </div>
      <HowItWorksSetion />
      <CtaSection />
      <div id="faq">
        <FAQ />
      </div>
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
}
