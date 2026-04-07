import { LandingNavbar } from "../../landing/Navbar";
import { LandingFooter } from "../../landing/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { TestimonialsSection } from "../../landing/TestimonialsSection";
import { GallerySection } from "./GallerySection";
import { CTASection } from "./CTASection";

export default function CorporateLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <GallerySection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <LandingFooter />
    </div>
  );
}
