"use client";

import Link from "next/link";
import { useState } from "react";

import { useForgotPassword } from "@/api/hooks/useAuth";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await forgotMutation.mutateAsync({ email });
    setSent(true);
  };

  return (
    <AuthShell side={<AuthHighlights />}>
      {/* Back to sign in link at top */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            className="font-semibold text-[#FF6B35] hover:text-[#E85A25] transition-colors"
            href="/auth/signin"
          >
            Go back to sign in
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Forgot your password?"
        subtitle="No worries. We'll send you a link to reset it."
      />

      <AuthFormCard footer={<AuthFooterLinks prompt="Need an account?" actionLabel="Create one" actionHref="/auth/signup" />}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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
              className={cn(
                "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
                "placeholder:text-gray-400",
                "focus:border-[#FF6B35] focus:bg-white focus:ring-[#FF6B35]/20"
              )}
            />
          </div>

          {forgotMutation.isError ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertTitle>Reset link failed</AlertTitle>
              <AlertDescription>
                {(forgotMutation.error as Error)?.message ?? "Unable to send reset link. Please try again."}
              </AlertDescription>
            </Alert>
          ) : null}

          {sent && !forgotMutation.isError ? (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertTitle>Check your inbox</AlertTitle>
              <AlertDescription>We sent a reset link if the email is registered.</AlertDescription>
            </Alert>
          ) : null}

          <Button
            className={cn(
              "h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all duration-300",
              "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
              "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
              "active:scale-[0.98]",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
            type="submit"
            disabled={forgotMutation.isPending}
          >
            {forgotMutation.isPending ? "Sending reset link..." : "Send reset link"}
          </Button>
        </form>
      </AuthFormCard>
    </AuthShell>
  );
}
