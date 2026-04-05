"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/navigation/Sidebar";
import { DashboardTopBar } from "@/components/navigation/DashboardTopBar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useUserStore";
import { cn } from "@/lib/utils";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
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
      router.replace("/auth/signin");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="p-6 text-sm text-slate-600">Preparing session...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Redirecting to sign in...
      </div>
    );
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <Sidebar />
      <SidebarInset className="flex flex-col min-h-svh bg-background pb-28 md:pb-0">
        <DashboardTopBar className="sticky top-0 z-30 border-b border-border" />
        {children}
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
