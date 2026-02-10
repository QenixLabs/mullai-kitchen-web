"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useResetPassword } from "@/api/hooks/useAuth";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const resetMutation = useResetPassword();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await resetMutation.mutateAsync({ token, new_password: newPassword });
    setDone(true);
  };

  return (
    <AuthShell side={<AuthHighlights />}>
      {/* Back to sign in link at top */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-600">
          Need the reset email?{" "}
          <Link className="font-semibold text-orange-600 hover:text-orange-700" href="/auth/forgot-password">
            Request a link
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Create a new password"
        subtitle="Choose something secure that you'll remember."
      />

      <AuthFormCard footer={<AuthFooterLinks prompt="Ready to sign in?" actionLabel="Return to sign in" actionHref="/auth/signin" />}>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="token" className="text-gray-700">
              Reset token
            </Label>
            <Input
              id="token"
              name="token"
              type="text"
              autoComplete="one-time-code"
              placeholder="Paste the token from your email"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              className="h-11 rounded-lg border-gray-300"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new_password" className="text-gray-700">
              New password
            </Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter a new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="h-11 rounded-lg border-gray-300"
            />
          </div>

          {resetMutation.isError ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertTitle>Reset failed</AlertTitle>
              <AlertDescription>
                {(resetMutation.error as Error)?.message ?? "Unable to reset password. Please try again."}
              </AlertDescription>
            </Alert>
          ) : null}

          {done && !resetMutation.isError ? (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertTitle>Password updated</AlertTitle>
              <AlertDescription>You can now sign in with your new password.</AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="h-11 w-full rounded-lg bg-orange-600 font-semibold text-white hover:bg-orange-700"
            type="submit"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? "Updating password..." : "Update password"}
          </Button>
        </form>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
