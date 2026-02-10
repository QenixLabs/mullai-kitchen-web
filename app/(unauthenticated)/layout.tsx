"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";

interface UnauthenticatedLayoutProps {
  children: ReactNode;
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return <div className="p-6 text-sm text-slate-600">Loading...</div>;
  }

  if (isAuthenticated) {
    return <div className="p-6 text-sm text-slate-600">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
