"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/useUserStore";

/**
 * Admin roles that have access to the admin panel
 */
const ADMIN_ROLES = ["superAdmin", "admin", "hubOwner"];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle tablet responsiveness - collapse sidebar on tablet
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)"
    );

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

  // Redirect non-authenticated users to auth page
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Redirect non-admin users to home page
  useEffect(() => {
    if (
      hasHydrated &&
      isAuthenticated &&
      user?.role &&
      !ADMIN_ROLES.includes(user.role)
    ) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, user?.role, router]);

  // Loading state - hydration pending
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Preparing admin session...
        </div>
      </div>
    );
  }

  // Redirect state - not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Redirecting to sign in...
        </div>
      </div>
    );
  }

  // Redirect state - not an admin user
  if (user?.role && !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-svh bg-background">
        <AdminHeader className="sticky top-0 z-30 border-b border-border" />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
