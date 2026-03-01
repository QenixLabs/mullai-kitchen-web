"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Stepper, type StepperItem } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";

const DEFAULT_STEPS: StepperItem[] = [
  { id: "welcome", title: "Welcome" },
  { id: "address", title: "Address" },
  { id: "profile", title: "Profile" },
  { id: "complete", title: "Complete" },
];

export interface OnboardingShellProps {
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canProceed: boolean;
  className?: string;
  steps?: StepperItem[];
  title?: string;
  subtitle?: string;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  isNavigating?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  showSkipButton?: boolean;
}

export function OnboardingShell({
  currentStep,
  totalSteps,
  children,
  onBack,
  onNext,
  onSkip,
  canProceed,
  className,
  steps = DEFAULT_STEPS,
  title = "Complete your onboarding",
  subtitle = "Add your address and preferences to personalize your meal experience.",
  nextLabel = "Next",
  backLabel = "Back",
  skipLabel = "Skip",
  isNavigating = false,
  showBackButton = true,
  showNextButton = true,
  showSkipButton = false,
}: OnboardingShellProps) {
  const normalizedStep = Math.min(Math.max(currentStep, 0), Math.max(totalSteps - 1, 0));
  const stepText = `Step ${normalizedStep + 1} of ${totalSteps}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-muted px-4 py-6 sm:px-8 sm:py-10">
      <div
        className={cn(
          "mx-auto w-full max-w-4xl overflow-hidden rounded-sm border border-border bg-card shadow-xl",
          className,
        )}
      >
        <header className="space-y-4 border-b border-border px-5 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Onboarding</p>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
              <p className=" text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <p className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{stepText}</p>
          </div>
          <Stepper items={steps.slice(0, totalSteps)} currentStep={normalizedStep} showDescriptions={false} />
        </header>

        <section className="p-5 sm:p-8">{children}</section>

        <footer className="flex flex-col gap-3 border-t border-border bg-muted/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {showBackButton ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 border-border sm:flex-none"
                onClick={onBack}
                disabled={normalizedStep === 0 || isNavigating}
              >
                {backLabel}
              </Button>
            ) : null}

            {showSkipButton && onSkip ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 flex-1 text-muted-foreground hover:text-foreground sm:flex-none"
                onClick={onSkip}
                disabled={isNavigating}
              >
                {skipLabel}
              </Button>
            ) : null}
          </div>

          {showNextButton ? (
            <Button
              type="button"
              className="h-11 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto sm:min-w-32"
              onClick={onNext}
              disabled={!canProceed || isNavigating}
            >
              {isNavigating ? "Please wait..." : nextLabel}
            </Button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
