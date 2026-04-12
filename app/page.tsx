
import { LandingNavbar } from "./landing/Navbar";
import { HeroSection } from "./landing/HeroSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { SafetyMeasuresSection } from "./landing/SafetyMeasuresSection";
import { NutritionFocusSection } from "./landing/NutritionFocusSection";
import { SourcingSection } from "./landing/SourcingSection";
import { PromoBanner } from "./landing/PromoBanner";
import { LandingFooter } from "./landing/Footer";
import { HomeIntroSection } from "./landing/HomeIntroSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <PromoBanner />
      <LandingNavbar />

      <main>
        <HeroSection />
        <HomeIntroSection />
        <NutritionFocusSection />
        <HowItWorksSection />
        <SafetyMeasuresSection />
        <SourcingSection />
      </main>

      <LandingFooter />
    </div>
  );
}
