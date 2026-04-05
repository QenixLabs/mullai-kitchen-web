"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";

import { useLogin } from "@/api/hooks/useAuth";
import { signInSchema, type SignInFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthFooterLinks,
  AuthFormCard,
  AuthHeader,
  AuthHighlights,
  AuthShell,
} from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useUserStore } from "@/providers/user-store-provider";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { cn } from "@/lib/utils";
import { formatAuthError, getAuthErrorTitle } from "@/lib/auth-errors";

const AUTH_ROUTES = new Set(["/auth/signin", "/auth/signup"]);

const getSafeRedirectPath = (redirectTo: string | null): string | null => {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return null;
  }

  const pathOnly = redirectTo.split("?")[0];
  if (AUTH_ROUTES.has(pathOnly)) {
    return null;
  }

  return redirectTo;
};

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((store) => store.user);
  const planIntentId = usePlanIntentStore((store) => store.planId);
  const loginMutation = useLogin();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = async (values: SignInFormData) => {
    const session = await loginMutation.mutateAsync(values);
    const authenticatedUser = session.user ?? user;

    if (authenticatedUser?.onboarding_completed === false) {
      router.push("/onboarding");
      return;
    }

    if (planIntentId && authenticatedUser?.onboarding_completed === true) {
      router.push("/checkout");
      return;
    }

    const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    router.push("/plans");
  };

  return (
    <AuthShell side={<AuthHighlights />}>
      {/* Existing user link at top */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary/90 transition-colors"
            href="/auth/signup"
          >
            Sign up
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to manage your subscriptions and track your orders."
      />

      <AuthFormCard
        footer={
          <AuthFooterLinks
            prompt="Forgot your password?"
            actionLabel="Reset it"
            actionHref="/auth/forgot-password"
          />
        }
      >
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="your@email.com"
                      className={cn(
                        "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
                        "placeholder:text-gray-400",
                        "focus:border-primary focus:bg-white focus:ring-primary/20",
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      id="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={cn(
                        "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
                        "placeholder:text-gray-400",
                        "focus:border-primary focus:bg-white focus:ring-primary/20",
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {loginMutation.isError ? (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 text-red-800"
              >
                <AlertTitle>{getAuthErrorTitle("signin")}</AlertTitle>
                <AlertDescription>
                  {formatAuthError(loginMutation.error, "signin")}
                </AlertDescription>
              </Alert>
            ) : null}

            <Button
              className={cn(
                "h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all duration-300",
                "bg-primary",
                "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
                "active:scale-[0.98]",
                "disabled:opacity-70 disabled:cursor-not-allowed",
              )}
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in with email"}
            </Button>
          </form>
        </Form>

        {/* Corporate CTA */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 p-4 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Ordering for your team?
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Corporate bulk ordering with postpaid billing
          </p>
          <Link
            href="/auth/corporate-signin"
            className=""
          >
            <Button variant={"secondary"} className="mt-3 cursor-pointer">Corporate Sign In</Button>
          </Link>
        </div>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-center text-gray-500">Loading...</div>}
    >
      <SignInForm />
    </Suspense>
  );
}
