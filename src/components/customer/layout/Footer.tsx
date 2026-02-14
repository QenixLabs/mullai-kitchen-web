"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Twitter,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
  ChefHat,
  Clock,
  Heart,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXPLORE_LINKS = [
  { label: "Weekly Menu", href: "/menu" },
  { label: "Gift Cards", href: "/gifts" },
  { label: "Corporate Plans", href: "/corporate" },
  { label: "Our Kitchens", href: "/kitchens" },
  { label: "About Us", href: "/about" },
];

const SUPPORT_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const QUICK_HIGHLIGHTS = [
  { icon: ChefHat, label: "Fresh Daily", description: "Made every morning" },
  { icon: Clock, label: "On-Time Delivery", description: "Never miss a meal" },
  { icon: Heart, label: "100+ Recipes", description: "Rotating menu" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gray-900 text-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#FF6B35]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#FF6B35]/30 to-transparent" />
      </div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="max-w-md">
                <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                  <Sparkles className="h-5 w-5 text-[#FF6B35]" />
                  <span className="text-sm font-medium text-[#FF6B35]">Newsletter</span>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Get exclusive offers & updates
                </h3>
                <p className="text-gray-400">
                  Subscribe for weekly menu previews, special discounts, and more.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="w-full max-w-md">
                {subscribed ? (
                  <div className="flex items-center gap-3 rounded-xl bg-green-500/20 px-5 py-4 text-green-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium">Thanks for subscribing!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className={cn(
                        "h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-white",
                        "placeholder:text-gray-500",
                        "focus:border-[#FF6B35] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                      )}
                    />
                    <button
                      type="submit"
                      className={cn(
                        "flex h-12 items-center gap-2 rounded-xl px-6 font-semibold text-white transition-all duration-300",
                        "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
                        "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-500/25",
                        "active:scale-[0.98]"
                      )}
                    >
                      Subscribe
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {QUICK_HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                      <Icon className="h-6 w-6 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF8555]">
                  <UtensilsCrossed className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Mullai Kitchen</h2>
                  <p className="text-xs text-gray-400">Fresh homestyle meals, delivered daily</p>
                </div>
              </div>
              <p className="mb-6 max-w-sm text-gray-400 leading-relaxed">
                Revolutionizing food subscriptions with authentic South Indian flavors
                and consistent quality across Chennai since 2024.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Twitter, label: "Twitter", href: "#" },
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: Facebook, label: "Facebook", href: "#" },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all duration-300 hover:bg-[#FF6B35] hover:text-white"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-8">
              {/* Explore Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#FF6B35]">
                  Explore
                </h3>
                <ul className="space-y-3">
                  {EXPLORE_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#FF6B35]">
                  Support
                </h3>
                <ul className="space-y-3">
                  {SUPPORT_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-gray-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#FF6B35]">
                  Contact
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="mailto:hello@mullaikitchen.in"
                      className="group flex items-start gap-3 text-gray-400 transition-colors hover:text-white"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-[#FF6B35]/20">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email us</p>
                        <p className="font-medium text-white">hello@mullaikitchen.in</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+914424901234"
                      className="group flex items-start gap-3 text-gray-400 transition-colors hover:text-white"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-[#FF6B35]/20">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Call us</p>
                        <p className="font-medium text-white">+91 44 2490 1234</p>
                      </div>
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm text-gray-300">
                        Old Mahabalipuram Road, Kottivakkam, Chennai - 600041
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-6 md:px-12 lg:px-16">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-gray-500">
                © {currentYear} Mullai Kitchen. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 transition-colors hover:text-white"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 transition-colors hover:text-white"
                >
                  Terms
                </Link>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-500 transition-colors hover:text-white"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
