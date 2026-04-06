import { LandingNavbar } from "../landing/Navbar";
import { LandingFooter } from "../landing/Footer";
import { TestimonialsSection } from "../landing/TestimonialsSection";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { PlansSection } from "./PlansSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { GallerySection } from "./GallerySection";
import { CTASection } from "./CTASection";

export default function IndividualPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <PlansSection />
        <HowItWorksSection />
        <GallerySection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  );
}
