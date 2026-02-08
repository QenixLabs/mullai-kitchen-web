"use client";

import Link from "next/link";
import { useState } from "react";

import { useForgotPassword } from "@/api/hooks/useAuth";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <span className="text-sm text-gray-600">
          Remembered your password?{" "}
          <Link className="font-semibold text-orange-600 hover:text-orange-700" href="/auth/signin">
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
              className="h-11 rounded-lg border-gray-300"
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
            className="h-11 w-full rounded-lg bg-orange-600 font-semibold text-white hover:bg-orange-700"
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
