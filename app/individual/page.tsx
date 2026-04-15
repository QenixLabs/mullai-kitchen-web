import { LandingNavbar } from "../landing/Navbar";
import { LandingFooter } from "../landing/Footer";
import { PromoBanner } from "../landing/PromoBanner";
import { HeroSection } from "./HeroSection";
import { PlansSection } from "./PlansSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { SafetyMeasuresSection } from "../landing/SafetyMeasuresSection";
import { TodaysMenuSection } from "./TodaysMenuSection";
import { GallerySection } from "./GallerySection";
import { TestimonialsSection } from "./TestimonialsSection";
import { FAQSection } from "./FAQSection";
import { CTASection } from "./CTASection";
import { TrustedCompaniesSection } from "../corporate/TrustedCompaniesSection";

export default function IndividualPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <LandingNavbar />

      <main>
        <HeroSection />
        <PlansSection />
        <HowItWorksSection />
        <SafetyMeasuresSection />
        <TodaysMenuSection />
        <GallerySection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <LandingFooter />
      <TrustedCompaniesSection />
      <PromoBanner />
    </div>
  );
}
