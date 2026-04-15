"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { useRegister, useSendSignupOtp, useVerifySignupOtp } from "@/api/hooks/useAuth";
import type { IRegisterRequest } from "@/api/types/auth.types";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Stepper } from "@/components/ui/stepper";
import { useForm } from "react-hook-form";
import { useUserStore } from "@/providers/user-store-provider";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { cn } from "@/lib/utils";
import { formatAuthError, getAuthErrorTitle } from "@/lib/auth-errors";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";

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

const SIGNUP_STEPS = [
  { id: "profile", title: "Profile", description: "Your personal details" },
  { id: "security", title: "Security", description: "Password & terms" },
  { id: "verify", title: "Verify", description: "Confirm your phone" },
  { id: "review", title: "Review", description: "Confirm & create" },
];

const inputBaseClass = cn(
  "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
  "placeholder:text-gray-400",
  "focus:border-primary focus:bg-white focus:ring-primary/20"
);

const primaryButtonClass = cn(
  "h-11 rounded-xl font-semibold text-white shadow-md transition-all duration-300",
  "bg-primary",
  "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
  "active:scale-[0.98]",
  "disabled:opacity-70 disabled:cursor-not-allowed"
);

const outlineButtonClass = cn(
  "h-11 rounded-xl font-medium transition-all duration-300",
  "border-2 border-gray-200 bg-white text-gray-600",
  "hover:border-primary/30 hover:bg-accent hover:text-primary",
  "active:scale-[0.98]",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((store) => store.user);
  const planIntentId = usePlanIntentStore((store) => store.planId);

  const registerMutation = useRegister();
  const sendSignupOtpMutation = useSendSignupOtp();
  const verifySignupOtpMutation = useVerifySignupOtp();

  const [currentStep, setCurrentStep] = useState(0);

  // Flat form state (not react-hook-form for OTP step)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",        // 10-digit, no +91
    email: "",
    password: "",
    acceptTerms: false,
    signup_token: "",
  });

  // OTP value for step 1
  const [otp, setOtp] = useState("");

  // Countdown timer for step 1
  const [timer, setTimer] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // React Hook Form used only for step 0 (profile) validation
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  // Start countdown when entering OTP step (step 2)
  useEffect(() => {
    if (currentStep === 2) {
      setTimer(60);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep]);

  // Cleanup timer on unmount to prevent leak when a resend is mid-flight
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // empty deps = runs cleanup only on unmount

  // Step 0 → Step 1: validate profile fields
  const handleProfileSubmit = async () => {
    const fieldsToValidate: (keyof SignUpFormData)[] = ["name", "phone"];
    // email is optional, only validate if filled
    const values = form.getValues();
    if (values.email && values.email.trim().length > 0) {
      fieldsToValidate.push("email");
    }

    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;

    const { name, phone, email } = form.getValues();
    setFormData((prev) => ({ ...prev, name, phone, email: email ?? "" }));
    setCurrentStep(1);
  };

  // Resend OTP (step 2)
  const handleResend = async () => {
    try {
      sendSignupOtpMutation.reset();
      await sendSignupOtpMutation.mutateAsync({ phone: `+91${formData.phone}` });
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(60);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // error shown via sendSignupOtpMutation.isError
    }
  };

  // Step 1 → Step 2: validate security fields then send OTP
  const handleSecurityNext = async () => {
    const fieldsToValidate: (keyof SignUpFormData)[] = ["password", "acceptTerms"];
    // Sync react-hook-form password/acceptTerms from formData
    form.setValue("password", formData.password);
    form.setValue("acceptTerms", formData.acceptTerms);
    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;

    sendSignupOtpMutation.reset();
    try {
      await sendSignupOtpMutation.mutateAsync({ phone: `+91${formData.phone}` });
    } catch {
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 → Step 3: verify OTP
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    verifySignupOtpMutation.reset();
    try {
      const result = await verifySignupOtpMutation.mutateAsync({
        phone: `+91${formData.phone}`,
        otp,
      });
      setFormData((prev) => ({ ...prev, signup_token: result.signup_token }));
      setCurrentStep(3);
    } catch {
      // React Query's mutation error state already handles the error display
      // just return to prevent step advance
      return;
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  // Step 3: final submit
  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerMutation.reset();

    const payload: {
      name: string;
      phone: string;
      password: string;
      signup_token: string;
      acceptTerms: boolean;
      email?: string;
    } = {
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      signup_token: formData.signup_token,
      acceptTerms: formData.acceptTerms,
    };

    if (formData.email && formData.email.trim().length > 0) {
      payload.email = formData.email.trim();
    }

    try {
      const session = await registerMutation.mutateAsync(payload as IRegisterRequest);
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
    } catch {
      // React Query's mutation error state already handles the error display
      // just return to prevent step advance
      return;
    }
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const profileValues = form.watch();
  const canContinueFromProfile =
    profileValues.name.trim().length > 1 &&
    profileValues.phone.trim().length === 10 &&
    !form.formState.errors.name &&
    !form.formState.errors.phone &&
    !form.formState.errors.email;

  const canContinueFromSecurity =
    formData.password.trim().length >= 8 &&
    formData.acceptTerms;

  return (
    <AuthShell side={<AuthHighlights />}>
      {/* Existing user link at top */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary/90 transition-colors"
            href="/auth/signin"
          >
            Log in
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Create an account"
        subtitle="Join thousands of customers enjoying fresh, home-style meals delivered daily."
      />

      <AuthFormCard>
        <Stepper items={SIGNUP_STEPS} currentStep={currentStep} showDescriptions={false} />

        {/* ── Step 0: Profile ── */}
        {currentStep === 0 && (
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleProfileSubmit();
              }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Full name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Anika Raman"
                        className={inputBaseClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Phone number</FormLabel>
                    <FormControl>
                      <div className="flex w-full items-center">
                        <span className="inline-flex h-11 items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 px-3 text-sm font-semibold text-gray-700">
                          +91
                        </span>
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          autoComplete="tel-national"
                          inputMode="numeric"
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);
                            field.onChange(digitsOnly);
                          }}
                          placeholder="9876543210"
                          className="h-11 rounded-l-none rounded-r-xl border-l-0 border-gray-200 bg-gray-50 focus:border-primary focus:bg-white focus:ring-primary/20"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email address{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        className={inputBaseClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {sendSignupOtpMutation.isError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                  <AlertTitle>{getAuthErrorTitle("signup")}</AlertTitle>
                  <AlertDescription>
                    {formatAuthError(sendSignupOtpMutation.error, "signup")}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className={cn(outlineButtonClass, "w-full sm:w-auto")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className={cn(primaryButtonClass, "w-full sm:w-auto px-8")}
                  disabled={!canContinueFromProfile}
                >
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* ── Step 1: Security ── */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className={inputBaseClass}
              />
              <p className="text-xs text-gray-500">Use at least 8 characters.</p>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-primary/5">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, acceptTerms: checked === true }))
                }
                className="mt-0.5 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                I accept the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-primary hover:text-primary/90 transition-colors"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            {sendSignupOtpMutation.isError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertTitle>{getAuthErrorTitle("signup")}</AlertTitle>
                <AlertDescription>
                  {formatAuthError(sendSignupOtpMutation.error, "signup")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={sendSignupOtpMutation.isPending}
                className={cn(outlineButtonClass, "w-full sm:w-auto")}
              >
                Back
              </Button>
              <Button
                type="button"
                className={cn(primaryButtonClass, "w-full sm:w-auto px-8")}
                onClick={handleSecurityNext}
                disabled={!canContinueFromSecurity || sendSignupOtpMutation.isPending}
              >
                {sendSignupOtpMutation.isPending ? "Sending OTP..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Verify Phone (OTP) ── */}
        {currentStep === 2 && (
          <form className="space-y-5" onSubmit={handleOtpSubmit}>
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-gray-900">+91{formData.phone}</span>
            </p>

            <div className="grid gap-2">
              <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                One-Time Password
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                className={inputBaseClass}
              />
            </div>

            <div className="text-center text-sm text-gray-500">
              {timer > 0 ? (
                <span>Resend OTP in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={sendSignupOtpMutation.isPending}
                  className="font-semibold text-primary hover:text-primary/90 transition-colors disabled:opacity-50"
                >
                  {sendSignupOtpMutation.isPending ? "Resending..." : "Resend OTP"}
                </button>
              )}
            </div>

            {verifySignupOtpMutation.isError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertTitle>Invalid OTP</AlertTitle>
                <AlertDescription>
                  {formatAuthError(verifySignupOtpMutation.error, "signup")}
                </AlertDescription>
              </Alert>
            )}

            {sendSignupOtpMutation.isError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertTitle>{getAuthErrorTitle("signup")}</AlertTitle>
                <AlertDescription>
                  {formatAuthError(sendSignupOtpMutation.error, "signup")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={verifySignupOtpMutation.isPending}
                className={cn(outlineButtonClass, "w-full sm:w-auto")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className={cn(primaryButtonClass, "w-full sm:w-auto px-8")}
                disabled={verifySignupOtpMutation.isPending || otp.length < 6}
              >
                {verifySignupOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>
          </form>
        )}

        {/* ── Step 3: Review ── */}
        {currentStep === 3 && (
          <form className="space-y-4" onSubmit={handleFinalSubmit}>
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Review details
              </h3>
              <div className="grid gap-2.5 text-sm">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500">Name:</span>
                  <span className="text-gray-900">{formData.name}</span>
                </div>
                {formData.email && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500">Email:</span>
                    <span className="text-gray-900">{formData.email}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500">Phone:</span>
                  <span className="text-gray-900">+91 {formData.phone}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                You can go back and edit any details before creating your account.
              </p>
            </div>

            {registerMutation.isError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertTitle>{getAuthErrorTitle("signup")}</AlertTitle>
                <AlertDescription>
                  {formatAuthError(registerMutation.error, "signup")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={registerMutation.isPending}
                className={cn(outlineButtonClass, "w-full sm:w-auto")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className={cn(primaryButtonClass, "w-full sm:w-auto px-8")}
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
        )}

        <div className="pt-4">
          <AuthFooterLinks
            prompt="Already have an account?"
            actionLabel="Sign in"
            actionHref="/auth/signin"
          />
          <Link
            className="text-xs font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
            href="/auth/corporate-signup"
          >
            Registering for a company? Corporate Account
          </Link>
        </div>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
