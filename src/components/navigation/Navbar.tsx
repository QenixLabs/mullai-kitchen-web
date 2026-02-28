"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  Calendar,
  UserCircle,
} from "lucide-react";

import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/use-user-store";
import { useLogout } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UNAUTH_NAV_ITEMS = [
  { name: "Our Menu", href: "/" },
  { name: "Plans", href: "/plans" },
  { name: "How it Works", href: "/#how-it-works" },
  { name: "About", href: "/#about" },
] as const;

const AUTH_NAV_ITEMS = [{ href: "/plans", label: "Plans" }] as const;

const MOBILE_BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/plans", icon: Calendar, label: "Plans" },
  { href: "/dashboard/subscriptions", icon: Calendar, label: "Subscriptions" },
  { href: "/dashboard/settings", icon: UserCircle, label: "Profile" },
] as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Don't render auth-dependent UI until hydrated
  const showAuthUI = hasHydrated;

  // Show hamburger menu only for unauthenticated users
  const showHamburger = !isAuthenticated;

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
                <Link href="/" className="text-xl font-bold text-[#FF6B35]">
                  Mullai Kitchen
                </Link>
              </div>

              {/* Desktop Navigation - Unauthenticated */}
              {showAuthUI && !isAuthenticated && (
                <nav className="hidden md:flex md:items-center md:space-x-8">
                  {UNAUTH_NAV_ITEMS.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-[#666666] transition-colors hover:text-[#FF6B35]"
                    >
                      {link.name}
                    </a>
                  ))}
                </nav>
              )}

              {/* Desktop Navigation - Authenticated */}
              {showAuthUI && isAuthenticated && (
                <nav className="hidden md:flex md:items-center md:space-x-1">
                  {AUTH_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-orange-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}

              {/* Desktop Buttons - Unauthenticated */}
              {showAuthUI && !isAuthenticated && (
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center rounded border border-[#666666] px-4 py-2 text-sm font-medium text-[#666666] transition-colors hover:border-[#FF6B35] hover:text-[#FF6B35]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center rounded bg-[#FF6B35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#e55a2b]"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Desktop Buttons - Authenticated */}
              {showAuthUI && isAuthenticated && (
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <span className="hidden text-xs text-gray-600 sm:inline">
                    {user?.name ?? user?.email ?? "Customer"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-[#666666] text-[#666666] hover:border-[#FF6B35] hover:text-[#FF6B35]"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? (
                      "Signing out..."
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Mobile menu button - Only for unauthenticated users */}
              {showHamburger && (
                <div className="flex md:hidden">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-[#333333] hover:bg-gray-100 hover:text-[#FF6B35] focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu - Unauthenticated */}
          {isMobileMenuOpen && showAuthUI && !isAuthenticated && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="space-y-1 px-4 pb-3 pt-2">
                {UNAUTH_NAV_ITEMS.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-[#666666] hover:bg-gray-50 hover:text-[#FF6B35]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="space-y-2 border-t border-gray-200 px-4 pb-4 pt-4">
                <Link
                  href="/auth/signin"
                  className="block w-full rounded border border-[#666666] px-4 py-2 text-center text-sm font-medium text-[#666666] transition-colors hover:border-[#FF6B35] hover:text-[#FF6B35]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signin"
                  className="block w-full rounded bg-[#FF6B35] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#e55a2b]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Bottom Navigation - Authenticated Mobile Only */}
      {isMobile && isAuthenticated && showAuthUI && (
        <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-orange-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-around">
            {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    isActive
                      ? "text-[#FF6B35]"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  <Icon
                    className={cn("h-6 w-6", isActive ? "scale-110" : "")}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* User Profile / Logout */}
            <div className="relative group">
              <button
                type="button"
                className="flex flex-col items-center gap-1 text-gray-500 transition-all hover:text-gray-700"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-6 w-6" />
                <span className="text-xs font-medium">
                  {logoutMutation.isPending ? "..." : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
