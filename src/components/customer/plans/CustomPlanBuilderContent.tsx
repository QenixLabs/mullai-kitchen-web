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
import { FaExclamationCircle, FaArrowLeft } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";

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
  const addresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);

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
        "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 bg-[#f0f0f0] min-h-screen",
        isAuthenticated && "pb-32 sm:pb-16",
        className,
      )}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#39070F] hover:opacity-70 transition-opacity mb-6"
      >
        <FaArrowLeft className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#39070F] mb-2"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Build Your Perfect Plan
        </h1>
        <p className="text-base text-gray-500">
          Customize your meals, duration, and preferences in three simple steps.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6 rounded-lg border">
          <FaExclamationCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Duration */}
          <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                1
              </div>
              <h2
                className="text-xl font-bold text-[#39070F]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Choose Duration
              </h2>
            </div>
            <DurationSelector value={duration} onChange={setDuration} />
          </section>

          {/* Step 2: Meal Types */}
          <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                2
              </div>
              <h2
                className="text-xl font-bold text-[#39070F]"
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
          <section className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                3
              </div>
              <h2
                className="text-xl font-bold text-[#39070F]"
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
              <div className="mt-6 pt-6 border-t border-gray-100">
                <WeeklyMenuPreview params={params} preference={preference} />
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-4 h-full lg:sticky lg:top-6">
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
