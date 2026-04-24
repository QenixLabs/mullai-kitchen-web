import { LandingNavbar } from "../landing/Navbar";
import { LandingFooter } from "../landing/Footer";
import { SourcingSection } from "../landing/SourcingSection";
import { NutritionFocusSection } from "../landing/NutritionFocusSection";
import { SafetyMeasuresSection } from "../landing/SafetyMeasuresSection";
import { HowItWorksSection } from "../landing/HowItWorksSection";
import { TestimonialsSection } from "../landing/TestimonialsSection";
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
      <LandingNavbar />

      <main>
        <HeroSection />
        <NutritionFocusSection />
        <BusinessSection />
        <GallerySection />
        <SourcingSection />
        <SafetyMeasuresSection />
        <HowItWorksSection />
        <CateringSection />
        <TestimonialsSection />
        <FAQSection />
      </main>

      <LandingFooter />
    </div>
  );
}
