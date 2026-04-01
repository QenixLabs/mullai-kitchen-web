"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CorporateSidebar } from "@/components/navigation/CorporateSidebar";
import { CorporateMobileBottomNav } from "@/components/navigation/CorporateMobileBottomNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuthHydrated, useIsAuthenticated, useCurrentUser } from "@/hooks/useUserStore";

interface CorporateLayoutProps {
  children: ReactNode;
}

export default function CorporateLayout({
  children,
}: CorporateLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");

    const applySidebarMode = (event?: MediaQueryListEvent) => {
      const isTablet = event ? event.matches : mediaQuery.matches;
      setSidebarOpen(!isTablet);
    };

    applySidebarMode();
    mediaQuery.addEventListener("change", applySidebarMode);

    return () => {
      mediaQuery.removeEventListener("change", applySidebarMode);
    };
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/corporate-signin");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role !== "corporate") {
      router.replace("/plans");
    }
  }, [hasHydrated, isAuthenticated, user?.role, router]);

  if (!hasHydrated) {
    return (
      <div className="p-6 text-sm text-slate-600">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Redirecting to sign in...
      </div>
    );
  }

  if (user?.role !== "corporate") {
    return (
      <div className="p-6 text-sm text-slate-600">
        Redirecting...
      </div>
    );
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <CorporateSidebar />
      <SidebarInset className="flex flex-col min-h-svh bg-background pb-28 md:pb-0">
        {children}
      </SidebarInset>
      <CorporateMobileBottomNav />
    </SidebarProvider>
  );
}
