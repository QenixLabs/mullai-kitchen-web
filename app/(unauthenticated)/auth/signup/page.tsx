"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

import { useRegister } from "@/api/hooks/useAuth";
import { signUpSchema, type SignUpFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Stepper } from "@/components/ui/stepper";
import { useUserStore } from "@/providers/user-store-provider";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { cn } from "@/lib/utils";

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
  { id: "review", title: "Review", description: "Confirm & create" },
];

const inputBaseClass = cn(
  "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
  "placeholder:text-gray-400",
  "focus:border-[#FF6B35] focus:bg-white focus:ring-[#FF6B35]/20"
);

const primaryButtonClass = cn(
  "h-11 rounded-xl font-semibold text-white shadow-md transition-all duration-300",
  "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
  "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
  "active:scale-[0.98]",
  "disabled:opacity-70 disabled:cursor-not-allowed"
);

const outlineButtonClass = cn(
  "h-11 rounded-xl font-medium transition-all duration-300",
  "border-2 border-gray-200 bg-white text-gray-600",
  "hover:border-[#FF6B35]/30 hover:bg-orange-50 hover:text-[#FF6B35]",
  "active:scale-[0.98]",
  "disabled:opacity-50 disabled:cursor-not-allowed"
);

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((store) => store.user);
  const planIntentId = usePlanIntentStore((store) => store.planId);
  const registerMutation = useRegister();
  const [currentStep, setCurrentStep] = useState(0);

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

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignUpFormData)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["name", "email", "phone"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["password", "acceptTerms"];
    }

    const valid = await form.trigger(fieldsToValidate);
    if (valid) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const handleSubmit = async (values: SignUpFormData) => {
    const session = await registerMutation.mutateAsync(values);
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

  const formValues = form.watch();
  const canContinueFromProfile =
    formValues.name.trim().length > 1 &&
    formValues.email.trim().length > 0 &&
    formValues.phone.trim().length === 10 &&
    !form.formState.errors.name &&
    !form.formState.errors.email &&
    !form.formState.errors.phone;

  const canContinueFromSecurity =
    formValues.password.trim().length >= 8 &&
    formValues.acceptTerms &&
    !form.formState.errors.password &&
    !form.formState.errors.acceptTerms;

  return (
    <AuthShell side={<AuthHighlights />}>
      {/* Existing user link at top */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            className="font-semibold text-[#FF6B35] hover:text-[#E85A25] transition-colors"
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

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            {currentStep === 0 ? (
              <>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email address</FormLabel>
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
                            className="h-11 rounded-l-none rounded-r-xl border-l-0 border-gray-200 bg-gray-50 focus:border-[#FF6B35] focus:bg-white focus:ring-[#FF6B35]/20"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {currentStep === 1 ? (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          className={inputBaseClass}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Use at least 8 characters.</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-orange-50/50">
                          <Checkbox
                            id="terms"
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35]"
                          />
                          <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                            I accept the{" "}
                            <Link href="/terms" className="font-semibold text-[#FF6B35] hover:text-[#E85A25] transition-colors">
                              Terms and Conditions
                            </Link>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            {currentStep === 2 ? (
              <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Review details</h3>
                <div className="grid gap-2.5 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500">Name:</span>
                    <span className="text-gray-900">{formValues.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500">Email:</span>
                    <span className="text-gray-900">{formValues.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500">Phone:</span>
                    <span className="text-gray-900">+91 {formValues.phone}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">You can go back and edit any details before creating your account.</p>
              </div>
            ) : null}

            {registerMutation.isError ? (
              <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
                <AlertTitle>Sign up failed</AlertTitle>
                <AlertDescription>
                  {(registerMutation.error as Error)?.message ?? "Unable to create account. Please try again."}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || registerMutation.isPending}
                className={cn(outlineButtonClass, "w-full sm:w-auto")}
              >
                Back
              </Button>

              <div className="w-full sm:w-auto">
                {currentStep < SIGNUP_STEPS.length - 1 ? (
                  <Button
                    className={cn(primaryButtonClass, "w-full sm:w-auto px-8")}
                    type="button"
                    onClick={handleNext}
                    disabled={
                      registerMutation.isPending ||
                      (currentStep === 0 && !canContinueFromProfile) ||
                      (currentStep === 1 && !canContinueFromSecurity)
                    }
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className={cn(primaryButtonClass, "w-full sm:w-auto px-8")}
                    type="submit"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>

        <div className="pt-4">
          <AuthFooterLinks prompt="Already have an account?" actionLabel="Sign in" actionHref="/auth/signin" />
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
