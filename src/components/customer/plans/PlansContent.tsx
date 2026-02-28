"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  useCustomerPlans,
  useMenuPreview,
  useServiceability,
} from "@/api/hooks/useCustomer";
import type {
  PlanBrowseItem,
  QueryCustomerPlans,
  ServiceabilityResponse,
} from "@/api/types/customer.types";
import { HeroSection } from "@/components/customer/plans/HeroSection";
import { HowItWorksSection } from "@/components/customer/plans/HowItWorksSection";
import { LocalFavoritesSection } from "@/components/customer/plans/LocalFavoritesSection";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { Sparkles, ChevronRight, PenLine, ArrowRight } from "lucide-react";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { cn } from "@/lib/utils";

const normalizePincode = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  return /^\d{6}$/.test(value) ? value : null;
};

export interface PlansContentProps {
  showHero?: boolean;
  showHowItWorks?: boolean;
  showLocalFavorites?: boolean;
  showBuildYourOwnBanner?: boolean;
  className?: string;
}

export function PlansContent({
  showHero = true,
  showHowItWorks = true,
  showLocalFavorites = true,
  showBuildYourOwnBanner = true,
  className,
}: PlansContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const persistedPincode = usePlanIntentStore((store) => store.checkedPincode);
  const setPlanIntent = usePlanIntentStore((store) => store.setPlanIntent);
  const setSourceRoute = usePlanIntentStore((store) => store.setSourceRoute);
  const setCheckedPincode = usePlanIntentStore((store) => store.setCheckedPincode);

  const [checkedPincodeState, setCheckedPincodeState] = useState<string | null>(
    () => {
      return normalizePincode(searchParams.get("pincode")) ?? persistedPincode;
    },
  );
  const [menuPlan, setMenuPlan] = useState<PlanBrowseItem | null>(null);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);

  // Filter state
  type DietFilter = "all" | "veg" | "non-veg";
  type MealTypeFilter = "Breakfast" | "Lunch" | "Dinner";
  const MEAL_TYPES: MealTypeFilter[] = ["Breakfast", "Lunch", "Dinner"];

  const [dietFilter, setDietFilter] = useState<DietFilter>("all");
  const [mealTypeFilters, setMealTypeFilters] = useState<Set<MealTypeFilter>>(
    new Set(),
  );

  const syncUrlState = useCallback(
    (nextState: { pincode?: string | null }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextState.pincode !== undefined) {
        if (nextState.pincode) {
          params.set("pincode", nextState.pincode);
        } else {
          params.delete("pincode");
        }
      }

      const queryString = params.toString();
      router.replace(
        queryString.length > 0 ? `/plans?${queryString}` : "/plans",
        { scroll: false },
      );
    },
    [router, searchParams],
  );

  const planQueryParams = useMemo<QueryCustomerPlans>(() => {
    return {
      pincode: checkedPincodeState ?? undefined,
    };
  }, [checkedPincodeState]);

  const plansQuery = useCustomerPlans(planQueryParams);
  const serviceabilityMutation = useServiceability();

  const menuPreviewQuery = useMenuPreview(menuPlan?._id);

  const plans = useMemo(
    () => plansQuery.data?.plans ?? [],
    [plansQuery.data?.plans],
  );

  const toggleMealType = (type: MealTypeFilter) => {
    setMealTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredPlans = useMemo(() => {
    let result = plans;

    // Meal type filter: keep plans that include ALL selected meal types
    if (mealTypeFilters.size > 0) {
      result = result.filter((plan) =>
        Array.from(mealTypeFilters).every((mt) =>
          plan.meals_included
            .map((m) => m.toLowerCase())
            .includes(mt.toLowerCase()),
        ),
      );
    }

    return result;
  }, [plans, mealTypeFilters]);
  const selectedPlanId = usePlanIntentStore((store) => store.planId);

  const handlePincodeCheck = async (
    pincode: string,
  ): Promise<ServiceabilityResponse> => {
    return serviceabilityMutation.mutateAsync({ pincode });
  };

  const handlePincodeResult = (
    result: ServiceabilityResponse,
    pincode: string,
  ) => {
    if (result.isServiceable) {
      setCheckedPincodeState(pincode);
      setCheckedPincode(pincode);
      syncUrlState({ pincode });
      return;
    }

    setCheckedPincodeState(null);
    setCheckedPincode(null);
    syncUrlState({ pincode: null });
  };

  const handleViewMenu = (plan: PlanBrowseItem) => {
    setMenuPlan(plan);
    setIsMenuSheetOpen(true);
  };

  const handleSelectPlan = (plan: PlanBrowseItem) => {
    setPlanIntent(plan._id, plan);
    setCheckedPincode(checkedPincodeState);

    const currentSearch = searchParams.toString();
    setSourceRoute(
      currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans",
    );

    const isSignedIn = hasHydrated && isAuthenticated;
    router.push(isSignedIn ? "/checkout" : "/auth/signin?redirect=/checkout");
  };

  const handleCustomPlanClick = () => {
    const currentSearch = searchParams.toString();
    const from =
      currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans";

    // Save current state for redirect back
    setSourceRoute(from);
    setCheckedPincode(checkedPincodeState);

    // Navigate to custom plan builder
    router.push("/custom-plan-builder");
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
        isAuthenticated && "pb-28 sm:pb-12",
        className,
      )}
    >
      {/* Hero Section - Only when enabled */}
      {showHero && (
        <HeroSection
          onPincodeCheck={handlePincodeCheck}
          onPincodeResult={handlePincodeResult}
          initialPincode={checkedPincodeState ?? ""}
          className="mb-10"
        />
      )}

      {/* How It Works Section - Only when enabled */}
      {showHowItWorks && <HowItWorksSection className="mb-12" />}

      {/* Plans Section */}
      <section className={isAuthenticated ? "mb-8 sm:mb-12" : "mb-8 sm:mb-12"}>
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary sm:text-xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {showHero ? "Curated Plans" : "Our Subscription Plans"}
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {showHero
                ? "Select Your Subscription"
                : "Choose Your Perfect Plan"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base max-w-2xl">
              {showHero
                ? "Flexible plans for every appetite and lifestyle."
                : "Select a plan that fits your routine. You can pause or cancel anytime."}
            </p>
          </div>
        </div>

        {/* Plans count badge - Show for all users */}
        <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent px-3 py-1.5 text-xs font-medium text-foreground sm:px-4 sm:py-2 sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {filteredPlans.length} plan
            {filteredPlans.length !== 1 ? "s" : ""} available
          </span>
          {/* Swipe hint for mobile */}
          <span className="flex items-center gap-1 text-xs text-muted-foreground/70 sm:hidden">
            Swipe to browse
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>

        {/* ── Filter Bar ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Diet & Meal Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Veg / Non-Veg cards */}
            <div className="flex items-center gap-2">
              <button
                id="filter-diet-all"
                onClick={() => setDietFilter("all")}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                  dietFilter === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200",
                )}
              >
                All Meals
              </button>
              <button
                id="filter-diet-veg"
                onClick={() => setDietFilter("veg")}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                  dietFilter === "veg"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-50/50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100",
                )}
              >
                Veg
              </button>
              <button
                id="filter-diet-nonveg"
                onClick={() => setDietFilter("non-veg")}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                  dietFilter === "non-veg"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-rose-50/50 text-rose-700 hover:bg-rose-50 border border-rose-100",
                )}
              >
                Non-Veg
              </button>
            </div>

            {/* Meal Type cards */}
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-100">
              {MEAL_TYPES.map((type) => {
                const isActive = mealTypeFilters.has(type);
                const colorClasses = {
                  Breakfast: isActive
                    ? "bg-amber-100 text-amber-900 border-amber-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-amber-50 hover:border-amber-100",
                  Lunch: isActive
                    ? "bg-orange-100 text-orange-900 border-orange-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:border-orange-100",
                  Dinner: isActive
                    ? "bg-indigo-100 text-indigo-900 border-indigo-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:border-indigo-100",
                };

                return (
                  <button
                    key={type}
                    id={`filter-meal-${type.toLowerCase()}`}
                    onClick={() => toggleMealType(type)}
                    className={cn(
                      "rounded-full px-5 py-2 text-sm font-medium border transition-all duration-200 flex items-center gap-2",
                      colorClasses[type],
                    )}
                  >
                    <span>{type}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear filters button */}
          {(dietFilter !== "all" || mealTypeFilters.size > 0) && (
            <button
              id="filter-clear"
              onClick={() => {
                setDietFilter("all");
                setMealTypeFilters(new Set());
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 transition-all duration-300 hover:border-gray-900 hover:text-gray-900 hover:bg-white active:scale-95"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* ── Build Your Own Plan Banner ── */}
        {showBuildYourOwnBanner && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-accent shadow-md shadow-primary/10">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
                <PenLine className="h-5 w-5 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Fully Customisable
                </p>
                <h3 className="mt-0.5 text-base font-black text-foreground sm:text-lg">
                  Build Your Own Plan
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Choose your meals, duration, and diet — we&apos;ll price it
                  just for you.
                </p>
              </div>

              {/* CTA */}
              <button
                id="custom-plan-cta"
                onClick={handleCustomPlanClick}
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        <PlanGrid
          plans={filteredPlans}
          onViewMenu={handleViewMenu}
          onSelectPlan={handleSelectPlan}
          isLoading={plansQuery.isLoading}
          isError={plansQuery.isError}
          errorMessage={
            plansQuery.error instanceof Error
              ? plansQuery.error.message
              : undefined
          }
          selectedPlanId={selectedPlanId}
          className=""
        />
      </section>

      {/* Local Favorites Section - Only when enabled */}
      {showLocalFavorites && <LocalFavoritesSection className="mb-0" />}

      {/* Menu Preview Sheet */}
      <MenuPreviewSheet
        open={isMenuSheetOpen}
        onOpenChange={setIsMenuSheetOpen}
        planName={menuPlan?.name}
        menu={menuPreviewQuery.data?.menu}
        isLoading={menuPreviewQuery.isLoading}
        isError={menuPreviewQuery.isError}
        errorMessage={
          menuPreviewQuery.error instanceof Error
            ? menuPreviewQuery.error.message
            : undefined
        }
        onRetry={() => {
          void menuPreviewQuery.refetch();
        }}
      />
    </div>
  );
}
