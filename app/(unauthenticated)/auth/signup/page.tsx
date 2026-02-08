"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useRegister } from "@/api/hooks/useAuth";
import { AuthFooterLinks, AuthFormCard, AuthHeader, AuthHighlights, AuthShell } from "@/components/Auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/ui/stepper";

const SIGNUP_STEPS = [
  { id: "profile", title: "Profile", description: "Your personal details" },
  { id: "security", title: "Security", description: "Password & terms" },
  { id: "review", title: "Review", description: "Confirm & create" },
];

export default function SignUpPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const canContinueFromProfile = name.trim().length > 1 && email.trim().length > 0 && phone.trim().length > 0;
  const canContinueFromSecurity = password.trim().length >= 8 && acceptTerms;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentStep < SIGNUP_STEPS.length - 1) {
      if (currentStep === 0 && !canContinueFromProfile) {
        return;
      }
      if (currentStep === 1 && !canContinueFromSecurity) {
        return;
      }
      setCurrentStep((step) => step + 1);
      return;
    }

    await registerMutation.mutateAsync({ name, email, phone, password });
    router.push("/dashboard");
  };

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          {currentStep === 0 ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700">
                  Full name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Anika Raman"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="h-11 rounded-lg border-gray-300"
                />
              </div>

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

              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-gray-700">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  className="h-11 rounded-lg border-gray-300"
                />
              </div>
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 rounded-lg border-gray-300"
                />
                <p className="text-xs text-gray-500">Use at least 8 characters.</p>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  className="mt-0.5 border-gray-300"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I accept the{" "}
                  <Link href="/terms" className="font-semibold text-orange-600 hover:text-orange-700">
                    Terms and Conditions
                  </Link>
                </label>
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Review details</h3>
              <div className="grid gap-2 text-sm">
                <p><span className="font-medium text-gray-700">Name:</span> {name}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {email}</p>
                <p><span className="font-medium text-gray-700">Phone:</span> {phone}</p>
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
              onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}
              disabled={currentStep === 0 || registerMutation.isPending}
              className="h-11 w-full rounded-lg border-gray-300 sm:w-auto"
            >
              Back
            </Button>

            <div className="w-full sm:w-auto">
              {currentStep < SIGNUP_STEPS.length - 1 ? (
                <Button
                  className="h-11 w-full rounded-lg bg-orange-600 px-8 font-semibold text-white hover:bg-orange-700 sm:w-auto"
                  type="submit"
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

        <div className="pt-4">
          <AuthFooterLinks prompt="Already have an account?" actionLabel="Sign in" actionHref="/auth/signin" />
        </div>
      </AuthFormCard>
    </AuthShell>
  );
}
