"use client";

import { useLogout, useMyProfile } from "@/api/hooks/useAuth";
import { useCurrentUser } from "@/hooks/use-user-store";

export default function DashboardPage() {
  const user = useCurrentUser();
  const logoutMutation = useLogout();
  const profileQuery = useMyProfile();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <section className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back, {user?.name ?? user?.email ?? "User"}.</p>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile Cache Status</h2>
        <p className="mt-2 text-sm text-slate-600">Query state: {profileQuery.status}</p>
      </section>

      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="w-fit rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
      </button>
    </main>
  );
}
