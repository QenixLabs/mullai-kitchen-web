"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "zustand";
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
import { createPlanIntentStore } from "@/stores/plan-intent-store";

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

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((store) => store.user);
  const [planIntentStore] = useState(() => createPlanIntentStore());
  const planIntentId = useStore(planIntentStore, (store) => store.planId);
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
    formValues.phone.trim().length > 0 &&
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
        <span className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="font-semibold text-orange-600 hover:text-orange-700" href="/auth/signin">
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
                      <FormLabel className="text-gray-700">Full name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Anika Raman"
                          className="h-11 rounded-lg border-gray-300"
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
                      <FormLabel className="text-gray-700">Email address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="your@email.com"
                          className="h-11 rounded-lg border-gray-300"
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
                      <FormLabel className="text-gray-700">Phone number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+91 98765 43210"
                          className="h-11 rounded-lg border-gray-300"
                        />
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
                      <FormLabel className="text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Create a strong password"
                          className="h-11 rounded-lg border-gray-300"
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
                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                          <Checkbox
                            id="terms"
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                            className="mt-0.5 border-gray-300"
                          />
                          <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                            I accept the{" "}
                            <Link href="/terms" className="font-semibold text-orange-600 hover:text-orange-700">
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
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Review details</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium text-gray-700">Name:</span> {formValues.name}</p>
                  <p><span className="font-medium text-gray-700">Email:</span> {formValues.email}</p>
                  <p><span className="font-medium text-gray-700">Phone:</span> {formValues.phone}</p>
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

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || registerMutation.isPending}
                className="h-11 w-full rounded-lg border-gray-300 sm:w-auto"
              >
                Back
              </Button>

              <div className="w-full sm:w-auto">
                {currentStep < SIGNUP_STEPS.length - 1 ? (
                  <Button
                    className="h-11 w-full rounded-lg bg-orange-600 px-8 font-semibold text-white hover:bg-orange-700 sm:w-auto"
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
                    className="h-11 w-full rounded-lg bg-orange-600 px-8 font-semibold text-white hover:bg-orange-700 sm:w-auto"
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
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
