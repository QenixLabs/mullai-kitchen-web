"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthenticatedNavbar } from "@/components/navigation/AuthenticatedNavbar";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return <div className="p-6 text-sm text-slate-600">Preparing session...</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-6 text-sm text-slate-600">Redirecting to sign in...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AuthenticatedNavbar />
      {children}
    </div>
  );
}
