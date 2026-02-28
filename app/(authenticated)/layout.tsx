"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/navigation/Sidebar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
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
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="flex flex-col min-h-svh bg-slate-50 pb-28 md:pb-0">
        {children}
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
