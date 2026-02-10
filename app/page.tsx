"use client";

import Link from "next/link";

import { useMyProfile } from "@/api/hooks/useAuth";
import { useAuthHydrated, useCurrentUser, useIsAuthenticated } from "@/hooks/use-user-store";

export default function Home() {
  const hasHydrated = useAuthHydrated();
  const user = useCurrentUser();
  const isAuthenticated = useIsAuthenticated();
  const myProfileQuery = useMyProfile();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16 md:px-12">
      
    </main>
  );
}
