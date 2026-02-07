"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-16">
      <section className="w-full rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign Up</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signup flow scaffold is ready. You can connect this page with the `useRegister` hook next.
        </p>

        <Link
          href="/auth/signin"
          className="mt-6 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Go to Sign In
        </Link>
      </section>
    </main>
  );
}
