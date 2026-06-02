"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useUserStore } from "@/providers/user-store-provider";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useUserStore";
import { isTokenExpired } from "@/lib/jwt";

interface UnauthenticatedLayoutProps {
  children: ReactNode;
}

export default function UnauthenticatedLayout({
  children,
}: UnauthenticatedLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const accessToken = useUserStore((store) => store.accessToken);
  const clearSession = useUserStore((store) => store.clearSession);
  const pathname = usePathname();
  const router = useRouter();
  const canAccessWhenAuthenticated =
    pathname?.startsWith("/plans") ||
    pathname?.startsWith("/custom-plan-builder");

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated && !canAccessWhenAuthenticated) {
      if (isTokenExpired(accessToken)) {
        clearSession();
        return;
      }
      router.replace("/");
    }
  }, [canAccessWhenAuthenticated, hasHydrated, isAuthenticated, accessToken, clearSession, router]);

  if (!hasHydrated) {
    return <div className="p-6 text-sm text-slate-600">Loading...</div>;
  }

  if (isAuthenticated && !canAccessWhenAuthenticated) {
    return <div className="p-6 text-sm text-slate-600">Redirecting...</div>;
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
