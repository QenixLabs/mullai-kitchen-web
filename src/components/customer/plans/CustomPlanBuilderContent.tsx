"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCreateCustomPlan } from "@/api/hooks/useCustomPlans";
import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";
import { DurationSelector } from "@/components/customer/plans/DurationSelector";
import {
  MealTypeSelector,
  type MealType,
} from "@/components/customer/plans/MealTypeSelector";
import { PreferenceToggle } from "@/components/customer/plans/PreferenceToggle";
import { WeeklyMenuPreview } from "@/components/customer/plans/WeeklyMenuPreview";
import { OrderSummaryPanel } from "@/components/customer/plans/OrderSummaryPanel";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddresses } from "@/api/hooks/useOnboarding";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_VEG_PRICE = 80;
const DEFAULT_NONVEG_PRICE = 120;

export interface CustomPlanBuilderContentProps {
  showFooter?: boolean;
  className?: string;
}

export function CustomPlanBuilderContent({
  showFooter = true,
  className,
}: CustomPlanBuilderContentProps) {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const createCustomPlan = useCreateCustomPlan();
  const addressesQuery = useAddresses();
  const addresses = addressesQuery.data ?? [];

  // Form state
  const [duration, setDuration] = useState<15 | 30 | null>(null);
  const [mealTypes, setMealTypes] = useState<Set<MealType>>(new Set());
  const [preference, setPreference] = useState<"VEG" | "NON_VEG" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore selections from session storage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("custom-plan-selections");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.duration) setDuration(parsed.duration);
          if (parsed.mealTypes) setMealTypes(new Set(parsed.mealTypes));
          if (parsed.preference) setPreference(parsed.preference);
        } catch {
          // Ignore parse errors
        }
      }
    }
  });

  // Save selections to session storage on change
  useState(() => {
    if (typeof window !== "undefined") {
      const data = { duration, mealTypes: Array.from(mealTypes), preference };
      sessionStorage.setItem("custom-plan-selections", JSON.stringify(data));
    }
  });

  // Build params for API calls
  const params = useMemo<CustomPlanMenuPreviewParams | null>(() => {
    if (!duration || mealTypes.size === 0 || !preference) {
      return null;
    }
    return {
      preference,
      meal_types: Array.from(mealTypes),
      days: duration,
      preview_days: 4,
    };
  }, [duration, mealTypes, preference]);

  // Check if continue button should be enabled
  const isContinueDisabled = useMemo(() => {
    if (!duration || mealTypes.size === 0 || !preference) {
      return true;
    }
    if (!hasHydrated) {
      return true;
    }
    if (isAuthenticated && addresses.length === 0) {
      return true;
    }
    return false;
  }, [
    duration,
    mealTypes,
    preference,
    hasHydrated,
    isAuthenticated,
    addresses.length,
  ]);

  // Handle continue to checkout
  const handleContinue = useCallback(async () => {
    setError(null);

    if (!duration || mealTypes.size === 0 || !preference) {
      return;
    }

    if (!isAuthenticated) {
      // Save selections and redirect to sign in
      const data = { duration, mealTypes: Array.from(mealTypes), preference };
      sessionStorage.setItem("custom-plan-selections", JSON.stringify(data));
      router.push(`/auth/signin?redirect=/custom-plan-builder`);
      return;
    }

    // If authenticated, need to create the custom plan first
    if (addresses.length === 0) {
      setError("Please add an address to continue.");
      return;
    }

    const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];

    try {
      const result = await createCustomPlan.mutateAsync({
        custom_days: duration,
        custom_meal_types: Array.from(mealTypes),
        custom_preference: preference,
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        address_id: defaultAddress._id,
      });

      // Store plan intent for checkout
      const planIntentStore = localStorage.getItem("mk-plan-intent");
      if (planIntentStore) {
        const intent = JSON.parse(planIntentStore);
        intent.planId = result._id;
        intent.planName = result.name;
        localStorage.setItem("mk-plan-intent", JSON.stringify(intent));
      }

      // Clear selections
      sessionStorage.removeItem("custom-plan-selections");

      router.push("/checkout");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create plan. Please try again.";
      setError(message);
    }
  }, [
    duration,
    mealTypes,
    preference,
    isAuthenticated,
    addresses,
    createCustomPlan,
    router,
  ]);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16",
        isAuthenticated && "pb-32 sm:pb-16",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0F172A] mb-3">
          Build Your Perfect Plan
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-medium">
          Customize your meals, duration, and preferences in three simple steps.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-8 rounded-sm border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-8 space-y-12">
          {/* Step 1: Duration */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] text-xs font-black">
                1
              </div>
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                Choose Duration
              </h2>
            </div>
            <DurationSelector value={duration} onChange={setDuration} />
          </section>

          {/* Step 2: Meal Types */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] text-xs font-black">
                2
              </div>
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                Select Your Meals
              </h2>
            </div>
            <MealTypeSelector
              selectedTypes={mealTypes}
              onChange={setMealTypes}
              disabled={!duration}
            />
          </section>

          {/* Step 3: Food Preference */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] text-xs font-black">
                3
              </div>
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                Food Preference
              </h2>
            </div>
            <PreferenceToggle
              value={preference}
              onChange={setPreference}
              vegPrice={DEFAULT_VEG_PRICE}
              nonvegPrice={DEFAULT_NONVEG_PRICE}
              disabled={mealTypes.size === 0}
            />
          </section>

          {/* Menu Preview Section */}
          <section className="pt-10 border-t border-slate-100">
            <WeeklyMenuPreview params={params} />
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4 h-full">
          <OrderSummaryPanel
            params={params}
            onContinue={handleContinue}
            isContinueDisabled={isContinueDisabled}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
