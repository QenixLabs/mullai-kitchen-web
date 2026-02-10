import type { ReactNode } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { PlanSummary } from "@/components/customer/checkout/PlanSummary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Stepper, type StepperItem } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

const DEFAULT_STEPS: StepperItem[] = [
  { id: "address", title: "Address" },
  { id: "start-date", title: "Start Date" },
  { id: "review", title: "Review" },
];

export interface CheckoutShellProps {
  children: ReactNode;
  currentStep: number;
  plan: PlanBrowseItem | null;
  checkedPincode?: string | null;
  sourceRoute?: string | null;
  className?: string;
  steps?: StepperItem[];
  title?: string;
  subtitle?: string;
}

export function CheckoutShell({
  children,
  currentStep,
  plan,
  checkedPincode = null,
  sourceRoute = null,
  className,
  steps = DEFAULT_STEPS,
  title = "Checkout",
  subtitle = "Secure checkout for your selected meal plan.",
}: CheckoutShellProps) {
  const stepCount = steps.length;
  const normalizedStep = Math.min(Math.max(currentStep, 0), Math.max(stepCount - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-100 px-4 py-6 sm:px-8 sm:py-10">
      <div
        className={cn(
          "mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-amber-100/60 bg-white shadow-xl",
          className,
        )}
      >
        <header className="space-y-4 border-b border-gray-100 px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Protected Route
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">{title}</h1>
              <p className="max-w-2xl text-sm text-gray-600">{subtitle}</p>
            </div>
            <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              Step {normalizedStep + 1} of {stepCount}
            </div>
          </div>

          <Stepper items={steps} currentStep={normalizedStep} showDescriptions={false} />

          {!plan ? (
            <Alert className="border-amber-300 bg-amber-50 text-amber-900">
              <ShieldCheck aria-hidden="true" />
              <AlertTitle>Plan intent required</AlertTitle>
              <AlertDescription>
                No plan selection is available in session. Coming soon in Phase 2: automatic checkout preview recovery.
              </AlertDescription>
            </Alert>
          ) : null}
        </header>

        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <main className="space-y-4" aria-label="Checkout content">
            {children}
          </main>

          <aside className="lg:sticky lg:top-6" aria-label="Plan summary rail">
            <PlanSummary plan={plan} checkedPincode={checkedPincode} sourceRoute={sourceRoute} />
          </aside>
        </div>
      </div>
    </div>
  );
}
