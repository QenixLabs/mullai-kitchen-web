"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { MapPin, Menu, X, ChevronDown, UtensilsCrossed, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInDown, slideInRight } from "./animations";

const chennaiAreas = [
  "Anna Nagar", "T. Nagar", "Adyar", "Mylapore", "Velachery", 
  "Nungambakkam", "Kodambakkam", "Porur", "Guindy", "Chromepet"
];

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState("Anna Nagar");
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#FAF7F2]/95 backdrop-blur-lg shadow-lg" 
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#39070F]">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${
              isScrolled ? "text-[#39070F]" : "text-white"
            }`}>
              Mullai Kitchen
            </span>
          </Link>

          {/* Desktop Location Pill */}
          <div className="hidden md:flex items-center">
            <motion.div 
              variants={fadeInDown}
              initial="initial"
              animate="animate"
              className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 shadow-md border border-[#39070F]/10"
            >
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <MapPin className="h-4 w-4 text-[#39070F]" />
              <span className="text-sm font-medium text-gray-700">Delivering to</span>
              <button
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                className="flex items-center gap-1 text-sm font-semibold text-[#39070F] hover:text-[#D4A574] transition-colors"
              >
                {selectedArea}, Chennai
                <ChevronDown className={`h-4 w-4 transition-transform ${showAreaDropdown ? "rotate-180" : ""}`} />
              </button>
            </motion.div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="tel:+919876543210"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#39070F]" : "text-white/90 hover:text-white"
              }`}
            >
              <Phone className="h-4 w-4" />
              Support
            </Link>
            <Link href="/plans">
              <Button 
                className="h-10 rounded-full bg-[#39070F] px-6 text-sm font-semibold text-white hover:bg-[#39070F]/90 shadow-lg shadow-[#39070F]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isScrolled ? "text-gray-900" : "text-white"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Area Dropdown */}
      <AnimatePresence>
        {showAreaDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Select Your Area
              </p>
              {chennaiAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => {
                    setSelectedArea(area);
                    setShowAreaDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedArea === area 
                      ? "bg-[#39070F]/10 text-[#39070F] font-medium" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {area}, Chennai
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-[#39070F]" />
                <span>Delivering to {selectedArea}, Chennai</span>
              </div>
              <div className="space-y-2">
                <Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full h-12 rounded-full bg-[#39070F] text-white font-semibold">
                    Get Started
                  </Button>
                </Link>
                <Link 
                  href="tel:+919876543210" 
                  className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700"
                >
                  <Phone className="h-4 w-4" />
                  Call Support
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
