"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  UtensilsCrossed,
  Heart,
  Shield,
  ChefHat,
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { floatAnimation } from "./animations";
import { cn } from "@/lib/utils";

const footerLinks = {
  explore: [
    { name: "Meal Plans", href: "/plans" },
    { name: "Today's Menu", href: "/plans" },
    { name: "How It Works", href: "#" },
    { name: "Pricing", href: "#pricing" }
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "FAQs", href: "#faq" },
    { name: "Contact Us", href: "tel:+919876543210" },
    { name: "Track Order", href: "#" }
  ],
  legal: [
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Refund Policy", href: "#" },
    { name: "Food Safety", href: "#" }
  ]
};

export function LandingFooter() {
  return (
    <footer className="relative bg-[#0d0205] text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-0 right-0"
        >
          <div className="w-96 h-96 bg-[#D4A574]/5 rounded-full blur-[150px]" />
        </motion.div>
        <motion.div
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 } }}
          className="absolute bottom-0 left-0"
        >
          <div className="w-80 h-80 bg-[#39070F]/10 rounded-full blur-[100px]" />
        </motion.div>

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212, 165, 116, 0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main Footer */}
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574] to-[#c49a6a] shadow-lg shadow-[#D4A574]/30 transition-transform group-hover:scale-110">
                <UtensilsCrossed className="h-5 w-5 text-[#39070F]" />
              </div>
              <span className="text-xl font-bold text-white">
                Mullai Kitchen
              </span>
            </Link>

            <p className="text-white/50 mb-6 leading-relaxed">
              Chennai&apos;s trusted cloud kitchen serving fresh, home-style South Indian
              meals delivered to your doorstep. Made with love, served with care.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-medium text-white mb-3">Subscribe for updates</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#D4A574]/50"
                />
                <Button className="bg-gradient-to-r from-[#D4A574] to-[#c49a6a] hover:from-[#e8c4a0] hover:to-[#D4A574] text-[#39070F] font-semibold shadow-lg shadow-[#D4A574]/20">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#D4A574] hover:border-[#D4A574] hover:text-[#39070F] transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-[#D4A574] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-[#D4A574] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#D4A574] mt-0.5 flex-shrink-0" />
                <span className="text-white/50 text-sm">
                  Building No. 51A, Bajanai Kovil Street,<br />
                  Sullaimedu, Chennai - 600094<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#D4A574] flex-shrink-0" />
                <a href="tel:+919876543210" className="text-white/50 hover:text-[#D4A574] transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#D4A574] flex-shrink-0" />
                <a href="mailto:hello@mullaikitchen.com" className="text-white/50 hover:text-[#D4A574] transition-colors">
                  hello@mullaikitchen.com
                </a>
              </li>
            </ul>

            {/* Certifications */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/40 mb-3">Certified by</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <Shield className="h-4 w-4 text-[#D4A574]" />
                  <span className="text-xs text-white/60 font-medium">FSSAI Licensed</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <ChefHat className="h-4 w-4 text-[#D4A574]" />
                  <span className="text-xs text-white/60 font-medium">ISO 22000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Mullai Kitchen. All rights reserved.
            </p>

            <p className="text-white/40 text-sm flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-[#D4A574] fill-[#D4A574]" /> in Chennai
            </p>

            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white/40 hover:text-white/60 text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
