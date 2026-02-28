"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
} from "lucide-react";

import {
  useAuthHydrated,
  useIsAuthenticated,
} from "@/hooks/use-user-store";
import { cn } from "@/lib/utils";

const UNAUTH_NAV_ITEMS = [
  { name: "Our Menu", href: "/" },
  { name: "Plans", href: "/plans" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "About", href: "/#about" },
] as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show navbar for authenticated users
  if (hasHydrated && isAuthenticated) return null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-shadow duration-300",
          isScrolled ? "shadow-md" : "",
        )}
      >
        {/* Background with backdrop blur */}
        <div className="border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-primary">
                  Mullai Kitchen
                </Link>
              </div>

              {/* Desktop Navigation - Unauthenticated */}
              <nav className="hidden md:flex md:items-center md:space-x-8">
                {UNAUTH_NAV_ITEMS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              {/* Desktop Buttons - Unauthenticated */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center rounded border border-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile menu button - Unauthenticated only */}
              <div className="flex md:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-gray-100 hover:text-primary focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu - Unauthenticated */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="space-y-1 px-4 pb-3 pt-2">
                {UNAUTH_NAV_ITEMS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="space-y-2 border-t border-gray-200 px-4 pb-4 pt-4">
                <Link
                  href="/auth/signin"
                  className="block w-full rounded border border-muted px-4 py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signin"
                  className="block w-full rounded bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
