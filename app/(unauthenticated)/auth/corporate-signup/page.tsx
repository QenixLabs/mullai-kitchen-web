"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

import { useCorporateRegister } from "@/api/hooks/useAuth";
import {
  corporateSignUpSchema,
  type CorporateSignUpFormData,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AuthFormCard,
  AuthHeader,
  CorporateHighlights,
  AuthShell,
} from "@/components/Auth";
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
import { cn } from "@/lib/utils";
import { formatAuthError, getAuthErrorTitle } from "@/lib/auth-errors";

const SIGNUP_STEPS = [
  { id: "company", title: "Company", description: "Your company details" },
  { id: "security", title: "Security", description: "Password & terms" },
];

const inputBaseClass = cn(
  "h-11 rounded-xl border-gray-200 bg-gray-50 text-gray-900",
  "placeholder:text-gray-400",
  "focus:border-primary focus:bg-white focus:ring-primary/20",
);

const primaryButtonClass = cn(
  "h-11 rounded-xl font-semibold text-white shadow-md transition-all duration-300",
  "bg-primary",
  "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
  "active:scale-[0.98]",
  "disabled:opacity-70 disabled:cursor-not-allowed",
);

const outlineButtonClass = cn(
  "h-11 rounded-xl font-medium transition-all duration-300",
  "border-2 border-gray-200 bg-white text-gray-600",
  "hover:border-primary/30 hover:bg-accent hover:text-primary",
  "active:scale-[0.98]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

function CorporateSignUpForm() {
  const router = useRouter();
  const registerMutation = useCorporateRegister();
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    email: "",
    company_name: "",
    password: "",
    acceptTerms: false,
  });

  const form = useForm<CorporateSignUpFormData>({
    resolver: zodResolver(corporateSignUpSchema),
    defaultValues: {
      email: "",
      company_name: "",
      password: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  // Step 0 -> Step 1: validate company fields
  const handleCompanySubmit = async () => {
    const fieldsToValidate: (keyof CorporateSignUpFormData)[] = [
      "email",
      "company_name",
    ];
    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;

    const { email, company_name } = form.getValues();
    setFormData((prev) => ({ ...prev, email, company_name }));
    setCurrentStep(1);
  };

  // Step 1: final submit
  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerMutation.reset();

    // Sync form state with our local state for validation
    form.setValue("password", formData.password);
    form.setValue("acceptTerms", formData.acceptTerms);

    const fieldsToValidate: (keyof CorporateSignUpFormData)[] = [
      "password",
      "acceptTerms",
    ];
    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;

    try {
      await registerMutation.mutateAsync({
        email: formData.email.trim(),
        company_name: formData.company_name.trim(),
        password: formData.password,
        acceptTerms: formData.acceptTerms,
      });
      router.push("/corporate/dashboard");
    } catch {
      // React Query's mutation error state handles error display
      return;
    }
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const companyValues = form.watch();
  const canContinueFromCompany =
    companyValues.email?.trim().length > 0 &&
    companyValues.company_name?.trim().length >= 2 &&
    !form.formState.errors.email &&
    !form.formState.errors.company_name;

  const canContinueFromSecurity =
    formData.password.trim().length >= 8 && formData.acceptTerms;

  return (
    <AuthShell side={<CorporateHighlights />}>
      {/* Top link */}
      <div className="mb-6 text-center">
        <span className="text-sm text-gray-500">
          Already have a corporate account?{" "}
          <Link
            className="font-semibold text-primary hover:text-primary/90 transition-colors"
            href="/auth/corporate-signin"
          >
            Sign in
          </Link>
        </span>
      </div>

      <AuthHeader
        title="Create Corporate Account"
        subtitle="Register your company to start bulk meal ordering."
      />

      <AuthFormCard>
        <Stepper
          items={SIGNUP_STEPS}
          currentStep={currentStep}
          showDescriptions={false}
        />

        {/* Step 0: Company */}
        {currentStep === 0 && (
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleCompanySubmit();
              }}
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
                        placeholder="company@yourdomain.com"
                        className={inputBaseClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Company name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="company_name"
                        type="text"
                        autoComplete="organization"
                        placeholder="Acme Technologies Pvt Ltd"
                        className={inputBaseClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  className={cn(
                    primaryButtonClass,
                    "w-full sm:w-auto px-8",
                  )}
                  disabled={!canContinueFromCompany}
                >
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 1: Security */}
        {currentStep === 1 && (
          <form className="space-y-4" onSubmit={handleFinalSubmit}>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className={inputBaseClass}
              />
              <p className="text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-primary/5">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    acceptTerms: checked === true,
                  }))
                }
                className="mt-0.5 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 cursor-pointer leading-relaxed"
              >
                I accept the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-primary hover:text-primary/90 transition-colors"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            {registerMutation.isError && (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 text-red-800"
              >
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
                className={cn(
                  primaryButtonClass,
                  "w-full sm:w-auto px-8",
                )}
                disabled={!canContinueFromSecurity || registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </div>
          </form>
        )}

        <div className="pt-4">
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            href="/auth/corporate-signin"
          >
            Already have a corporate account? Sign in
          </Link>
        </div>
      </AuthFormCard>
    </AuthShell>
  );
}

export default function CorporateSignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500">Loading...</div>
      }
    >
      <CorporateSignUpForm />
    </Suspense>
  );
}
