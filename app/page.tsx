import { LandingNavbar } from "./landing/Navbar";
import { LandingFooter } from "./landing/Footer";
import { SourcingSection } from "./landing/SourcingSection";
import { NutritionFocusSection } from "./landing/NutritionFocusSection";
import { SafetyMeasuresSection } from "./landing/SafetyMeasuresSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { HeroSection } from "./corporate/HeroSection";
import { BusinessSection } from "./corporate/BusinessSection";
import { CateringSection } from "./corporate/CateringSection";
import { GallerySection } from "./corporate/GallerySection";
import { FAQSection } from "./corporate/FAQSection";
import { TrustedCompaniesSection } from "./corporate/TrustedCompaniesSection";

export default function CorporateLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TrustedCompaniesSection />
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
        <TestimonialsSection />
        <FAQSection />
      </main>

      <LandingFooter />
    </div>
  );
}
