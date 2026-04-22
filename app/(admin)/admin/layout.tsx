"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/useUserStore";
import { isAdminRole } from "@/api/types/user.types";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Redirect non-authenticated users to auth page
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Redirect non-admin users to home page
  useEffect(() => {
    if (
      hasHydrated &&
      isAuthenticated &&
      user?.role &&
      !isAdminRole(user.role)
    ) {
      router.replace("/plans");
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
  if (user?.role && !isAdminRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Redirecting to dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#e6e6e6" }}>
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <AdminHeader onMenuClick={() => setMobileSidebarOpen(true)} />
      <main
        className="min-h-screen pt-[72px] pb-14 px-4 transition-all duration-300 lg:pl-[288px] lg:pr-8 lg:pt-[88px]"
        style={{ backgroundColor: "#e6e6e6" }}
      >
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
