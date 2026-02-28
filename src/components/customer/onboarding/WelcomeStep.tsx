"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WelcomeStepProps {
  onGetStarted: () => void;
  className?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  highlights?: string[];
}

const DEFAULT_HIGHLIGHTS = [
  "Save one or more delivery addresses",
  "Choose your default delivery location",
  "Add profile preferences whenever you are ready",
];

export function WelcomeStep({
  onGetStarted,
  className,
  title = "Welcome to Mullai Kitchen",
  description = "We are just a couple of quick steps away from setting up your personalized meal journey.",
  ctaLabel = "Get Started",
  highlights = DEFAULT_HIGHLIGHTS,
}: WelcomeStepProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-primary/10 to-background p-5 sm:p-7">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Personalized setup
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-foreground">
          {highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-start">
        <Button
          type="button"
          onClick={onGetStarted}
          className="h-11 w-full bg-primary px-8 font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
