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
  Heart
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <footer className="bg-[#1a0509] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A574]">
                <UtensilsCrossed className="h-5 w-5 text-[#39070F]" />
              </div>
              <span className="text-xl font-bold text-white">
                Mullai Kitchen
              </span>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Chennai's trusted cloud kitchen serving fresh, home-style South Indian 
              meals delivered to your doorstep. Made with love, served with care.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-medium text-white mb-3">Subscribe for updates</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
                <Button className="bg-[#D4A574] hover:bg-[#c49a6a] text-[#39070F] font-semibold">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4A574] hover:text-[#39070F] transition-colors"
                >
                  <Icon className="h-5 w-5" />
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
                    className="text-gray-400 hover:text-[#D4A574] transition-colors"
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
                    className="text-gray-400 hover:text-[#D4A574] transition-colors"
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
                <span className="text-gray-400 text-sm">
                  Building No. 51A, Bajanai Kovil Street,<br />
                  Sullaimedu, Chennai - 600094<br />
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#D4A574] flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-[#D4A574] transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#D4A574] flex-shrink-0" />
                <a href="mailto:hello@mullaikitchen.com" className="text-gray-400 hover:text-[#D4A574] transition-colors">
                  hello@mullaikitchen.com
                </a>
              </li>
            </ul>

            {/* Certifications */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-500 mb-3">Certified by</p>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-white/10 rounded text-xs text-gray-400 font-medium">
                  FSSAI Licensed
                </div>
                <div className="px-3 py-1.5 bg-white/10 rounded text-xs text-gray-400 font-medium">
                  ISO 22000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Mullai Kitchen. All rights reserved.
            </p>
            
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> in Chennai
            </p>

            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
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
