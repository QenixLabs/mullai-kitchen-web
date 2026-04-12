import { LandingNavbar } from "../landing/Navbar";
import { LandingFooter } from "../landing/Footer";
import { PromoBanner } from "../landing/PromoBanner";
import { SourcingSection } from "../landing/SourcingSection";
import { NutritionFocusSection } from "../landing/NutritionFocusSection";
import { SafetyMeasuresSection } from "../landing/SafetyMeasuresSection";
import { HowItWorksSection } from "../landing/HowItWorksSection";
import { HeroSection } from "./HeroSection";
import { BusinessSection } from "./BusinessSection";
import { CateringSection } from "./CateringSection";
import { GallerySection } from "./GallerySection";
import { FAQSection } from "./FAQSection";
import { TrustedCompaniesSection } from "./TrustedCompaniesSection";

export default function CorporateLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TrustedCompaniesSection />
      <PromoBanner />
      <LandingNavbar />

      <main>
        <HeroSection />
        <NutritionFocusSection />
        <BusinessSection />
        <HowItWorksSection />
        <SafetyMeasuresSection />
        <SourcingSection />
        <CateringSection />
        <GallerySection />
        <FAQSection />
      </main>

      <LandingFooter />
    </div>
  );
}
