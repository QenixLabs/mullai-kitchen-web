"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useForgotPassword, useResetPassword, useVerifyResetOtp } from "@/api/hooks/useAuth";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { formatAuthError, getAuthErrorTitle } from "@/lib/auth-errors";
import { cn } from "@/lib/utils";

type Step = "phone" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");

  // Shared state across steps
  const [phone, setPhone] = useState(""); // stores the 10-digit number (without +91)
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Resend timer
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const forgotMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyResetOtp();
  const resetMutation = useResetPassword();

  // Start/resume countdown timer
  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgotMutation.reset();
    await forgotMutation.mutateAsync({ phone: `+91${phone}` });
    setStep("otp");
    startCountdown();
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      await forgotMutation.mutateAsync({ phone: `+91${phone}` });
      startCountdown();
    } catch {
      // error is shown via forgotMutation.isError
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    verifyOtpMutation.reset();
    const result = await verifyOtpMutation.mutateAsync({ phone: `+91${phone}`, otp });
    setResetToken(result.reset_token);
    setStep("password");
  };

  // Step 3: Reset password
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMutation.reset();
    await resetMutation.mutateAsync({ token: resetToken, new_password: newPassword });
    router.push("/auth/signin");
  };

  const inputClass = cn(
    "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
    "placeholder:text-gray-400",
    "focus:border-primary focus:bg-white focus:ring-primary/20"
  );

  const buttonClass = cn(
    "h-11 w-full rounded-xl font-semibold text-white shadow-md transition-all duration-300",
    "bg-primary",
    "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
    "active:scale-[0.98]",
    "disabled:opacity-70 disabled:cursor-not-allowed"
  );

  return (
    <AuthShell side={<AuthHighlights />}>
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Remembered your password?{" "}
          <Link className="font-semibold text-primary hover:text-primary/90 transition-colors" href="/auth/signin">
            Go back to sign in
          </Link>
        </span>
      </div>

      {/* Step 1: Phone */}
      {step === "phone" && (
        <>
          <AuthHeader title="Forgot your password?" subtitle="Enter your registered mobile number. We'll send an OTP via WhatsApp." />
          <AuthFormCard footer={<AuthFooterLinks prompt="Need an account?" actionLabel="Create one" actionHref="/auth/signup" />}>
            <form className="space-y-5" onSubmit={handlePhoneSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Mobile Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 px-3 text-sm text-gray-500">+91</span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    required
                    maxLength={10}
                    pattern="\d{10}"
                    className="rounded-l-none rounded-r-xl border-gray-200 bg-gray-50 h-11 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-primary/20"
                  />
                </div>
              </div>

              {forgotMutation.isError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertTitle>{getAuthErrorTitle("forgot-password")}</AlertTitle>
                  <AlertDescription>{formatAuthError(forgotMutation.error, "forgot-password")}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className={buttonClass} disabled={forgotMutation.isPending}>
                {forgotMutation.isPending ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </AuthFormCard>
        </>
      )}

      {/* Step 2: OTP */}
      {step === "otp" && (
        <>
          <AuthHeader title="Enter the OTP" subtitle={`We sent a 6-digit OTP to +91${phone} via WhatsApp.`} />
          <AuthFormCard footer={<AuthFooterLinks prompt="Wrong number?" actionLabel="Go back" actionHref="/auth/forgot-password" />}>
            <form className="space-y-5" onSubmit={handleOtpSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className={inputClass}
                />
              </div>

              <div className="text-center text-sm text-gray-500">
                {countdown > 0 ? (
                  <span>Resend OTP in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={forgotMutation.isPending}
                    className="font-semibold text-primary hover:text-primary/90 transition-colors disabled:opacity-50"
                  >
                    {forgotMutation.isPending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              {verifyOtpMutation.isError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertTitle>Invalid OTP</AlertTitle>
                  <AlertDescription>{formatAuthError(verifyOtpMutation.error, "forgot-password")}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className={buttonClass} disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          </AuthFormCard>
        </>
      )}

      {/* Step 3: New password */}
      {step === "password" && (
        <>
          <AuthHeader title="Create a new password" subtitle="Choose something secure that you'll remember." />
          <AuthFormCard footer={<AuthFooterLinks prompt="Ready to sign in?" actionLabel="Return to sign in" actionHref="/auth/signin" />}>
            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="new_password" className="text-sm font-medium text-gray-700">New Password</Label>
                <PasswordInput
                  id="new_password"
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-primary/20"
                />
              </div>

              {resetMutation.isError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertTitle>{getAuthErrorTitle("reset-password")}</AlertTitle>
                  <AlertDescription>{formatAuthError(resetMutation.error, "reset-password")}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className={buttonClass} disabled={resetMutation.isPending}>
                {resetMutation.isPending ? "Updating password..." : "Update password"}
              </Button>
            </form>
          </AuthFormCard>
        </>
      )}
    </AuthShell>
  );
}
