"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CorporateSidebar } from "@/components/navigation/CorporateSidebar";
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
    <SidebarProvider>
      <CorporateSidebar />
      <SidebarInset className="flex flex-col min-h-svh bg-background pb-28 md:pb-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
