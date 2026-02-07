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
      <section className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-amber-700">Mullai Kitchen</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          Frontend Foundation Ready
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Server state is managed with React Query and local user state is handled with Zustand.
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">User State</h2>
        <p className="text-sm text-slate-600">
          Hydrated: <span className="font-medium">{String(hasHydrated)}</span>
        </p>
        <p className="text-sm text-slate-600">
          Authenticated: <span className="font-medium">{String(isAuthenticated)}</span>
        </p>
        <p className="text-sm text-slate-600">
          User: <span className="font-medium">{user?.email ?? "No active session"}</span>
        </p>
        <p className="text-sm text-slate-600">
          Profile Query: <span className="font-medium">{myProfileQuery.status}</span>
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/auth/signin"
          className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Sign Up
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Dashboard
        </Link>
      </section>
    </main>
  );
}
