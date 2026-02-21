'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut } from 'lucide-react';

import { useAuthHydrated, useIsAuthenticated, useCurrentUser } from '@/hooks/use-user-store';
import { useLogout } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const UNAUTH_NAV_ITEMS = [
  { name: 'Weekly Menu', href: '#weekly-menu' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Corporate', href: '#corporate' },
] as const;

const AUTH_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/plans', label: 'Plans' },
] as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Don't render auth-dependent UI until hydrated
  const showAuthUI = hasHydrated;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-shadow duration-300',
        isScrolled ? 'shadow-md' : ''
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
                  {user?.name ?? user?.email ?? 'Customer'}
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
                    'Signing out...'
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
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

        {/* Mobile menu - Authenticated */}
        {isMobileMenuOpen && showAuthUI && isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {AUTH_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="space-y-2 border-t border-gray-200 px-4 pb-4 pt-4">
              <span className="block px-3 py-2 text-sm text-gray-600">
                {user?.name ?? user?.email ?? 'Customer'}
              </span>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#666666] text-[#666666] hover:border-[#FF6B35] hover:text-[#FF6B35]"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  'Signing out...'
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
