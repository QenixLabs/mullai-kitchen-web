
import dynamic from "next/dynamic";
import { LandingNavbar } from "./landing/Navbar";
import { HeroSection } from "./landing/HeroSection";
import { PromoBanner } from "./landing/PromoBanner";

const LiveKitchenStatus = dynamic(() => import("./landing/LiveKitchenStatus").then(mod => mod.LiveKitchenStatus), { ssr: true });
const HowItWorksSection = dynamic(() => import("./landing/HowItWorksSection").then(mod => mod.HowItWorksSection), { ssr: true });
const TodaysMenuSection = dynamic(() => import("./landing/TodaysMenuSection").then(mod => mod.TodaysMenuSection), { ssr: true });
const PricingSection = dynamic(() => import("./landing/PricingSection").then(mod => mod.PricingSection), { ssr: true });
const TrustSection = dynamic(() => import("./landing/TrustSection").then(mod => mod.TrustSection), { ssr: true });
const TestimonialsSection = dynamic(() => import("./landing/TestimonialsSection").then(mod => mod.TestimonialsSection), { ssr: true });
const FAQSection = dynamic(() => import("./landing/FAQSection").then(mod => mod.FAQSection), { ssr: true });
const CTASection = dynamic(() => import("./landing/CTASection").then(mod => mod.CTASection), { ssr: true });
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
        <TrustSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      
      <LandingFooter />
    </div>
  );
}
