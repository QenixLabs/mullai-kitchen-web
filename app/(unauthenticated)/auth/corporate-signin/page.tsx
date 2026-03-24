"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";

import { useLogin } from "@/api/hooks/useAuth";
import { signInSchema, type SignInFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthFooterLinks,
  AuthFormCard,
  AuthHeader,
  CorporateHighlights,
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
import { cn } from "@/lib/utils";
import { formatAuthError, getAuthErrorTitle } from "@/lib/auth-errors";

const AUTH_ROUTES = new Set(["/auth/signin", "/auth/signup"]);

const getSafeRedirectPath = (redirectTo: string | null): string | null => {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return null;
  }

  const pathOnly = redirectTo.split("?")[0];
  if (AUTH_ROUTES.has(pathOnly)) {
    return null;
  }

  return redirectTo;
};

function CorporateSignInForm() {
  const router = useRouter();
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

    const redirectTo = getSafeRedirectPath(
      new URLSearchParams(window.location.search).get("redirect"),
    );
    if (redirectTo) {
      router.push(redirectTo);
      return;
    }

    router.push("/corporate");
  };

  return (
    <AuthShell side={<CorporateHighlights />}>
      {/* Top link */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Don&apos;t have a corporate account?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary/90 transition-colors"
            href="/auth/corporate-signup"
          >
            Register
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Corporate Sign In"
        subtitle="Access your bulk order dashboard and manage meal deliveries."
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
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign in with email"}
            </Button>
          </form>
        </Form>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function CorporateSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500">Loading...</div>
      }
    >
      <CorporateSignInForm />
    </Suspense>
  );
}
