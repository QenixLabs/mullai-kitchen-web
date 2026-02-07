"use client";

import { FormEvent, useState } from "react";

import { useLogin } from "@/api/hooks/useAuth";

export default function SignInPage() {
  const loginMutation = useLogin();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Password123");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">Authenticate and populate Zustand user state.</p>

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-amber-200 focus:ring"
          required
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-amber-200 focus:ring"
          required
        />

        {loginMutation.isError ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {loginMutation.error instanceof Error ? loginMutation.error.message : "Failed to sign in"}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="mt-6 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
