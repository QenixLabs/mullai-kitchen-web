
import dynamic from "next/dynamic";
import { LandingNavbar } from "./landing/Navbar";
import { HeroSection } from "./landing/HeroSection";
import { PromoBanner } from "./landing/PromoBanner";
import { LiveKitchenStatus } from "./landing/LiveKitchenStatus";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { TodaysMenuSection } from "./landing/TodaysMenuSection";
import { PricingSection } from "./landing/PricingSection";
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
        <PromoBanner />
        <LiveKitchenStatus />
        <HowItWorksSection />
        <TodaysMenuSection />
        <PricingSection />
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
