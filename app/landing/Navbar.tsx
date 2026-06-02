"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Menu, X, ChevronDown, User2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInDown } from "./animations";
import { cn } from "@/lib/utils";
import { useIsAuthenticated, useAuthHydrated, useCurrentUser } from "@/hooks/useUserStore";
import { UserRole, isAdminRole, isDeliveryPartnerRole } from "@/api/types/user.types";

const chennaiAreas = [
  "Anna Nagar", "T. Nagar", "Adyar", "Mylapore", "Velachery",
  "Nungambakkam", "Kodambakkam", "Porur", "Guindy", "Chromepet", "Tambaram", "ECR", "OMR", "Anna Salai",
  "Pallavaram", "Chetpet", "Poonamallee"
];

function getDashboardUrl(role: string | undefined): string {
  if (role === UserRole.Corporate) return "/corporate/dashboard";
  if (isAdminRole(role)) return "/admin";
  if (isDeliveryPartnerRole(role)) return "/delivery";
  return "/plans";
}

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState("Anna Nagar");
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const hasHydrated = useAuthHydrated();
  const user = useCurrentUser();

  const isCorporatePage = pathname === "/" || pathname === "/corporate";
  const isIndividualPage = pathname === "/individual";
  const isCorporateOnlyPage = pathname === "/corporate";
  const aboutLink = isCorporateOnlyPage ? "/corporate#who-mullai-is" : "/#who-mullai-is";
  const contactLink = isCorporateOnlyPage ? "/corporate#faq" : "/#faq";

  const handleGetStarted = () => {
    if (!hasHydrated) return;
    router.push(isAuthenticated ? getDashboardUrl(user?.role) : "/auth/signup");
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
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[linear-gradient(96deg,#4e0d1a_0%,#7a1127_56%,#4e0d1a_100%)] shadow-xl"
          : "bg-[linear-gradient(96deg,#5d101d_0%,#7a1127_56%,#5d101d_100%)]"
      )}
    >
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between h-20 lg:h-20">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <Image
              src="/logo-tranparent.png"
              alt="Mullai Kitchen Logo"
              width={300}
              height={80}
              className="object-contain h-20 w-auto"
            />
          </Link>

          {/* Desktop/Tablet Location Selector */}
          <motion.div
            variants={fadeInDown}
            initial="initial"
            animate="animate"
            className="relative hidden xl:flex"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 hover:bg-white/95 transition-all shadow-lg">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground/75">Delivering to:</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className="flex items-center gap-1 text-base font-semibold text-primary hover:text-primary/80 transition-colors h-auto p-0"
                aria-expanded={showAreaDropdown}
              >
                <span className="max-w-44 lg:max-w-none truncate">Chennai, Tamil Nadu</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  showAreaDropdown && "rotate-180"
                )} />
              </Button>
            </div>

            <AnimatePresence>
              {showAreaDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-3 left-0 w-64 bg-white border border-border rounded-2xl shadow-2xl overflow-hidden py-2 z-50"
                  onMouseLeave={() => setShowAreaDropdown(false)}
                >
                  <div className="max-h-75 overflow-y-auto custom-scrollbar">
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
                            ? "text-primary bg-muted font-semibold hover:bg-muted"
                            : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
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
        </div>

        {/* Desktop Location Pill & Nav Items */}
        <div className="hidden xl:flex items-center gap-7">
          <Link href={aboutLink} className="text-base tracking-wide font-bold uppercase text-white/95 hover:text-white transition-colors">
            About
          </Link>

          <Link href="/#gallery" className="text-base tracking-wide font-bold uppercase text-white/95 hover:text-white transition-colors">
            Gallery
          </Link>

          <Link href="/#kitchen" className="text-base tracking-wide font-bold uppercase text-white/95 hover:text-white transition-colors">
            Kitchen
          </Link>

          <Link href={contactLink} className="text-base tracking-wide font-bold uppercase text-white/95 hover:text-white transition-colors">
            Contact
          </Link>

          {/* Show switch button based on current page */}
          {isCorporatePage && (
            <Link href="/individual" className="inline-flex items-center gap-2 text-base tracking-wide font-bold uppercase text-skin hover:text-skin/85 transition-colors">
              <User2 className="h-4 w-4" />
              Individual
            </Link>
          )}
          {isIndividualPage && (
            <Link href="/corporate" className="inline-flex items-center gap-2 text-base tracking-wide font-bold uppercase text-skin hover:text-skin/85 transition-colors">
              <Building2 className="h-4 w-4" />
              Corporate
            </Link>
          )}

          <Button asChild className="bg-white hover:bg-white/90 text-primary font-bold rounded-full px-7 h-11 text-base tracking-wide shadow-lg transition-all active:scale-95">
            {hasHydrated && isAuthenticated ? (
              <Link href={getDashboardUrl(user?.role)}>MY DASHBOARD</Link>
            ) : (
              <Link href="/auth/signin">LOGIN</Link>
            )}
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex xl:hidden items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4"
          >
            {hasHydrated && isAuthenticated ? (
              <Link href={getDashboardUrl(user?.role)}>Dashboard</Link>
            ) : (
              <Link href="/auth/signin">Login</Link>
            )}
          </Button>

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
            className="xl:hidden bg-primary border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-skin font-medium px-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Select Delivery Area</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 bg-white/5 rounded-2xl max-h-62.5 overflow-y-auto">
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
                          ? "bg-skin text-primary font-bold hover:bg-skin"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <Link href={aboutLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                    About
                  </Button>
                </Link>
                <Link href="/#gallery" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                    Gallery
                  </Button>
                </Link>
                <Link href="/#kitchen" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                    Kitchen
                  </Button>
                </Link>
                <Link href={contactLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                    Contact
                  </Button>
                </Link>

                {/* Show switch button based on current page */}
                {isCorporatePage && (
                  <Link href="/individual">
                    <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                      <User2 className="h-4 w-4 mr-2" />
                      Individual
                    </Button>
                  </Link>
                )}
                {isIndividualPage && (
                  <Link href="/corporate">
                    <Button variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                      <Building2 className="h-4 w-4 mr-2" />
                      Corporate
                    </Button>
                  </Link>
                )}
                {hasHydrated && isAuthenticated ? (
                  <Button asChild variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                    <Link href={getDashboardUrl(user?.role)}>My Dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="border-white/20 text-primary hover:bg-white/10 w-full rounded-xl h-12">
                    <Link href="/auth/signin">Login to Account</Link>
                  </Button>
                )}
                <Button onClick={handleGetStarted} className="bg-skin hover:bg-[#C39463] text-primary w-full font-bold rounded-xl h-12 shadow-lg shadow-skin/20">
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
