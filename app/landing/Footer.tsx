"use client";

import Link from "next/link";
import { Share2, Mail } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Meal Plans", href: "/plans" },
    { name: "Today's Menu", href: "/plans" },
    { name: "How It Works", href: "#" },
    { name: "Pricing", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Contact Us", href: "tel:+918428129262" },
    { name: "FAQs", href: "#faq" },
    { name: "Track Order", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative bg-primary-dark text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-primary-dark via-primary to-primary-dark opacity-95" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--skin))_1px,transparent_0)] bg-size-[40px_40px]" />
      </div>

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-primary-foreground">Mullai</span>
            </Link>

            <p className="text-base text-white leading-relaxed">
              Chennai&apos;s trusted cloud kitchen serving fresh, home-style
              South 
              Indian meals delivered to your doorstep. Made with love,
              served with care.
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-base font-semibold text-primary-foreground mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-skin transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-base font-semibold text-primary-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-skin transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-medium/70">
        <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-skin text-sm text-center sm:text-left">
              © {new Date().getFullYear()} Mullai. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-primary-medium/30 border border-primary-medium/70 text-skin flex items-center justify-center hover:bg-skin hover:border-skin hover:text-primary transition-all"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="mailto:founder@mullai.net"
                className="w-9 h-9 rounded-full bg-primary-medium/30 border border-primary-medium/70 text-skin flex items-center justify-center hover:bg-skin hover:border-skin hover:text-primary transition-all"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
