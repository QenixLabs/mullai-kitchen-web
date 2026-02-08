"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLogin } from "@/api/hooks/useAuth";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loginMutation.mutateAsync({ email, password });
    router.push("/dashboard");
  };

  return (
    <AuthShell side={<AuthHighlights />}>
      {/* Existing user link at top */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-600">
          Do not have an account?{" "}
          <Link className="font-semibold text-orange-600 hover:text-orange-700" href="/auth/signup">
            Sign up
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to manage your subscriptions and track your orders."
      />

      <AuthFormCard footer={<AuthFooterLinks prompt="Forgot your password?" actionLabel="Reset it" actionHref="/auth/forgot-password" />}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-700">
              Email address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-12 rounded-lg !border-slate-300 !bg-white text-slate-900 placeholder:text-slate-400 dark:!bg-white focus-visible:border-orange-500 focus-visible:ring-orange-200"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-12 rounded-lg !border-slate-300 !bg-white text-slate-900 placeholder:text-slate-400 dark:!bg-white focus-visible:border-orange-500 focus-visible:ring-orange-200"
            />
          </div>

          {loginMutation.isError ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertTitle>Sign in failed</AlertTitle>
              <AlertDescription>
                {(loginMutation.error as Error)?.message ?? "Unable to sign in. Please try again."}
              </AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="h-11 w-full rounded-lg bg-orange-600 font-semibold text-white hover:bg-orange-700"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in with email"}
          </Button>
        </form>
      </AuthFormCard>
    </AuthShell>
  );
}
