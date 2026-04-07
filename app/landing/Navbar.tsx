"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInDown } from "./animations";
import { cn } from "@/lib/utils";
import { useIsAuthenticated, useAuthHydrated } from "@/hooks/useUserStore";

const chennaiAreas = [
  "Anna Nagar", "T. Nagar", "Adyar", "Mylapore", "Velachery",
  "Nungambakkam", "Kodambakkam", "Porur", "Guindy", "Chromepet", "Tambaram", "ECR", "OMR", "Anna Salai",
  "Pallavaram", "Chetpet", "Poonamallee"
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState("Anna Nagar");
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const hasHydrated = useAuthHydrated();

  // Determine which page we're on
  const isCorporatePage = pathname === "/";
  const isIndividualPage = pathname === "/individual";

  const handleGetStarted = () => {
    if (!hasHydrated) return;
    router.push(isAuthenticated ? "/plans" : "/auth/signup");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[#1a0509]/95 backdrop-blur-lg shadow-lg border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo-tranparent.png"
            alt="Mullai Kitchen Logo"
            width={250}
            height={250}
            className="object-contain"
          />
          {/* <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight leading-tight">
              Mullai
            </span>
            <span className="text-xs text-skin/80 tracking-wide">
              your everyday meal partner
            </span>
          </div> */}
        </Link>

        {/* Desktop Location Pill & Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            className="relative"
          >
            <div className="flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-xl px-5 py-2.5 border border-white/20 hover:border-skin/40 transition-all">
              <span className="text-xs font-medium text-white/60 uppercase tracking-widest">Delivering to</span>
              <div className="w-px h-4 bg-white/20" />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className="flex items-center gap-2 text-sm font-semibold text-white hover:text-skin transition-colors h-auto p-0"
                aria-expanded={showAreaDropdown}
              >
                <MapPin className="h-4 w-4 text-skin" />
                {selectedArea}, Chennai
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  showAreaDropdown && "rotate-180"
                )} />
              </Button>
            </div>

            {/* Area Dropdown */}
            <AnimatePresence>
              {showAreaDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-3 right-0 w-64 bg-[#1a0509]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
                  onMouseLeave={() => setShowAreaDropdown(false)}
                >
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {chennaiAreas.map((area) => (
                      <Button
                        key={area}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSelectedArea(area);
                          setShowAreaDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-sm transition-colors h-auto justify-start rounded-none",
                          selectedArea === area
                            ? "text-skin bg-white/5 font-semibold hover:bg-white/5"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {area}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Show switch button based on current page */}
          {isCorporatePage && (
            <Link href="/individual" className="text-sm font-medium text-white/80 hover:text-white transition-all hover:translate-y-[-1px]">
              Individual
            </Link>
          )}
          {isIndividualPage && (
            <Link href="/" className="text-sm font-medium text-white/80 hover:text-white transition-all hover:translate-y-[-1px]">
              Corporate
            </Link>
          )}

          {!isAuthenticated && (
            <Link href="/auth/signin" className="text-sm font-medium text-white/80 hover:text-white transition-all hover:translate-y-[-1px]">
              Login
            </Link>
          )}

          <Button onClick={handleGetStarted} className="bg-skin hover:bg-[#C39463] text-[#1a0509] font-bold rounded-full px-8 shadow-lg shadow-skin/20 hover:shadow-skin/30 transition-all active:scale-95">
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">
          {/* Login Button - Visible on mobile when not authenticated */}
          {!isAuthenticated && (
            <Link href="/auth/signin">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4"
              >
                Login
              </Button>
            </Link>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-xl h-auto w-auto"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1a0509] border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-skin font-medium px-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Select Delivery Area</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 bg-white/5 rounded-2xl max-h-[250px] overflow-y-auto">
                  {chennaiAreas.map((area) => (
                    <Button
                      key={area}
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSelectedArea(area);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "text-left px-3 py-2.5 text-xs rounded-lg transition-all h-auto justify-start",
                        selectedArea === area
                          ? "bg-skin text-[#1a0509] font-bold hover:bg-skin"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                {/* Show switch button based on current page */}
                {isCorporatePage && (
                  <Link href="/individual">
                    <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                      Individual
                    </Button>
                  </Link>
                )}
                {isIndividualPage && (
                  <Link href="/">
                    <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                      Corporate
                    </Button>
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link href="/auth/signin">
                    <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                      Login to Account
                    </Button>
                  </Link>
                )}
                <Button onClick={handleGetStarted} className="bg-skin hover:bg-[#C39463] text-[#1a0509] w-full font-bold rounded-xl h-12 shadow-lg shadow-skin/20">
                  {isAuthenticated ? "Dashboard" : "Get Started Now"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}