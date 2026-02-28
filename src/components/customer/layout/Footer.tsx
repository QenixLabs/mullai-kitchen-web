"use client";

import Link from "next/link";
import { UtensilsCrossed, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-white">Mullai Kitchen</h2>
              <p className="text-xs text-gray-400">Fresh homestyle meals, delivered daily</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <a
            href="mailto:hello@mullaikitchen.in"
            className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <Mail className="h-4 w-4" />
            <span>hello@mullaikitchen.in</span>
          </a>

          {/* Copyright */}
          <p className="text-xs text-gray-600">
            © {currentYear} Mullai Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
