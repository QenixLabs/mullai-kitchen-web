"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useUserStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddresses } from "@/api/hooks/useOnboarding";
import { FaExclamationCircle } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";

const DEFAULT_VEG_PRICE = 80;
const DEFAULT_NONVEG_PRICE = 120;

export interface CustomPlanBuilderContentProps {
  showFooter?: boolean;
  className?: string;
}

export function CustomPlanBuilderContent({
  className,
}: CustomPlanBuilderContentProps) {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const createCustomPlan = useCreateCustomPlan();
  const addressesQuery = useAddresses();
  const addresses = useMemo(
    () => addressesQuery.data ?? [],
    [addressesQuery.data],
  );

  const setPlanIntent = usePlanIntentStore((store) => store.setPlanIntent);
  const setSourceRoute = usePlanIntentStore((store) => store.setSourceRoute);

  // Form state
  const [duration, setDuration] = useState<15 | 30 | null>(null);
  const [mealTypes, setMealTypes] = useState<Set<MealType>>(new Set());
  const [preference, setPreference] = useState<"VEG" | "NON_VEG" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore selections from session storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("custom-plan-selections");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (parsed.duration) setDuration(parsed.duration);
          if (parsed.mealTypes) setMealTypes(new Set(parsed.mealTypes));
          if (parsed.preference) setPreference(parsed.preference);
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Save selections to session storage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = { duration, mealTypes: Array.from(mealTypes), preference };
      sessionStorage.setItem("custom-plan-selections", JSON.stringify(data));
    }
  }, [duration, mealTypes, preference]);

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

      // Store plan intent for checkout using the store provider
      setPlanIntent(result._id, {
        ...result,
        duration: `${result.custom_days} Days`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      setSourceRoute("/custom-plan-builder");

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
    setPlanIntent,
    setSourceRoute,
  ]);

  return (
    <div
      className={cn(
        "mx-auto min-h-screen w-full max-w-305 bg-[#F5F3F4] px-4 pt-5 pb-6 sm:px-6 sm:pt-6 sm:pb-8 lg:px-8",
        isAuthenticated && "pb-32 sm:pb-16",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-[36px] font-extrabold leading-none uppercase tracking-tight text-[#391219]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            BUILD YOUR PERFECT PLAN
          </h1>
          <p className="mt-1.5 text-[15px] text-[#6F666A]">
            Customize your culinary journey with chef-curated nutrition.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="rounded-full px-3 py-1.5 text-sm font-bold uppercase tracking-[0.06em] text-[#4A1A24] transition-colors hover:bg-[#EEE8EA]"
        >
          ← Back
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6 rounded-lg border">
          <FaExclamationCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_312px] xl:grid-cols-[minmax(0,1fr)_328px] lg:gap-7">
        {/* Left Column - Configuration */}
        <div className="space-y-7">
          {/* Step 1: Duration */}
          <section>
            <div className="mb-4">
              <h2
                className="text-[20px] font-bold leading-none text-[#3A1219]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Choose Duration
              </h2>
            </div>
            <DurationSelector value={duration} onChange={setDuration} />
          </section>

          {/* Step 2: Meal Types */}
          <section>
            <div className="mb-4">
              <h2
                className="text-[20px] font-bold leading-none text-[#3A1219]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
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
            <div className="mb-4">
              <h2
                className="text-[20px] font-bold leading-none text-[#3A1219]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
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

            {/* Menu Preview - Inside Food Preference section */}
            {preference && (
              <div className="mt-7">
                <WeeklyMenuPreview params={params} preference={preference} />
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <div className="h-full lg:sticky lg:top-6">
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
