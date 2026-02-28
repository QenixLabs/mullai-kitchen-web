"use client";

import { CircleCheckBig, MapPinned, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export interface OnboardingCompleteProps {
  addressesCount: number;
  hasProfileDetails?: boolean;
  className?: string;
  redirectSeconds?: number;
  onRedirect?: () => void;
}

export function OnboardingComplete({
  addressesCount,
  hasProfileDetails = false,
  className,
  redirectSeconds = 2,
  onRedirect,
}: OnboardingCompleteProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(redirectSeconds);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsRemaining((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      onRedirect?.();
    }, redirectSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [onRedirect, redirectSeconds]);

  const summary = useMemo(
    () => [
      {
        id: "addresses",
        icon: MapPinned,
        label: "Addresses saved",
        value: `${addressesCount}`,
      },
      {
        id: "profile",
        icon: UserRoundCheck,
        label: "Profile details",
        value: hasProfileDetails ? "Added" : "Skipped",
      },
    ],
    [addressesCount, hasProfileDetails],
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50 p-5 text-center sm:p-8">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CircleCheckBig className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Onboarding complete</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          Your account is now ready. We are preparing the next step in your customer journey.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {summary.map((item) => (
          <article key={item.id} className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
            <div className="flex items-center gap-2 text-foreground">
              <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide">{item.label}</p>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{item.value}</p>
          </article>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Redirecting in <span className="font-semibold text-primary">{secondsRemaining}</span>
        {" "}
        second{secondsRemaining === 1 ? "" : "s"}...
      </p>
    </div>
  );
}
