
import dynamic from "next/dynamic";
import { LandingNavbar } from "./landing/Navbar";
import { HeroSection } from "./landing/HeroSection";
import { ScaleOfCookingSection } from "./landing/ScaleOfCookingSection";
import { PromoBanner } from "./landing/PromoBanner";
import { LiveKitchenStatus } from "./landing/LiveKitchenStatus";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { SafetyMeasuresSection } from "./landing/SafetyMeasuresSection";
import { NutritionFocusSection } from "./landing/NutritionFocusSection";
import { SourcingSection } from "./landing/SourcingSection";
import { TodaysMenuSection } from "./landing/TodaysMenuSection";
import { GallerySection } from "./landing/GallerySection";
import { TrustSection } from "./landing/TrustSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { FAQSection } from "./landing/FAQSection";
import { CTASection, BulkOrdersSection } from "./landing";
import { LandingFooter } from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <LandingNavbar />

      <main>
        <HeroSection />
        <ScaleOfCookingSection />
        {/* <PromoBanner /> */}
        <HowItWorksSection />
        <GallerySection />
        {/* <LiveKitchenStatus /> */}
        <SafetyMeasuresSection />
        <NutritionFocusSection />
        <SourcingSection />
        <TodaysMenuSection corporate />
        <BulkOrdersSection />
        <TrustSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
}
