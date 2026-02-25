"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand";

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
import { Navbar } from "@/components/navigation/Navbar";
import Footer from "@/components/customer/layout/Footer";
import { HeroSection } from "@/components/customer/plans/HeroSection";
import { HowItWorksSection } from "@/components/customer/plans/HowItWorksSection";
import { LocalFavoritesSection } from "@/components/customer/plans/LocalFavoritesSection";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import {
  Sparkles,
  ChevronRight,
  Leaf,
  Drumstick,
  UtensilsCrossed,
  PenLine,
  ArrowRight,
} from "lucide-react";
import { createPlanIntentStore } from "@/stores/plan-intent-store";
import { cn } from "@/lib/utils";

const normalizePincode = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  return /^\d{6}$/.test(value) ? value : null;
};

function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const [planIntentStore] = useState(() => createPlanIntentStore());

  const persistedPincode = useStore(
    planIntentStore,
    (store) => store.checkedPincode,
  );
  const setPlanIntent = useStore(
    planIntentStore,
    (store) => store.setPlanIntent,
  );
  const setSourceRoute = useStore(
    planIntentStore,
    (store) => store.setSourceRoute,
  );
  const setCheckedPincode = useStore(
    planIntentStore,
    (store) => store.setCheckedPincode,
  );

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
  const selectedPlanId = useStore(planIntentStore, (store) => store.planId);

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
    <div className="min-h-screen bg-white">
      <Navbar />

      <main
        className={cn(
          "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
          isAuthenticated && "pb-28 sm:pb-8",
        )}
      >
        {/* Hero Section - Only for unauthenticated */}
        {!isAuthenticated && (
          <HeroSection
            onPincodeCheck={handlePincodeCheck}
            onPincodeResult={handlePincodeResult}
            initialPincode={checkedPincodeState ?? ""}
            className="mb-10"
          />
        )}

        {/* How It Works Section - Only for unauthenticated */}
        {!isAuthenticated && <HowItWorksSection className="mb-12" />}

        {/* Plans Section */}
        <section
          className={isAuthenticated ? "mb-8 sm:mb-12" : "mb-8 sm:mb-12"}
        >
          {/* Section Header - Only for unauthenticated */}
          {!isAuthenticated && (
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF6B35] sm:text-xs">
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Curated Plans
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                  Select Your Subscription
                </h2>
                <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
                  Flexible plans for every appetite and lifestyle.
                </p>
              </div>
            </div>
          )}

          {/* Plans count badge - Show for all users */}
          <div className="mb-5 flex items-center gap-3 sm:mb-6 sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-medium text-gray-700 sm:px-4 sm:py-2 sm:text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
              {filteredPlans.length} plan
              {filteredPlans.length !== 1 ? "s" : ""} available
            </span>
            {/* Swipe hint for mobile */}
            <span className="flex items-center gap-1 text-xs text-gray-400 sm:hidden">
              Swipe to browse
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>

          {/* ── Filter Bar ── */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Diet & Meal Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Veg / Non-Veg cards */}
              <div className="flex items-stretch gap-2 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
                <button
                  id="filter-diet-all"
                  onClick={() => setDietFilter("all")}
                  className={`relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    dietFilter === "all"
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {dietFilter === "all" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-400" />
                  )}
                  All Meals
                </button>
                <button
                  id="filter-diet-veg"
                  onClick={() => setDietFilter("veg")}
                  className={`relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    dietFilter === "veg"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {dietFilter === "veg" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-green-500" />
                  )}
                  <Leaf className="inline-block h-4 w-4 mr-1.5" />
                  Veg
                </button>
                <button
                  id="filter-diet-nonveg"
                  onClick={() => setDietFilter("non-veg")}
                  className={`relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    dietFilter === "non-veg"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  {dietFilter === "non-veg" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-red-500" />
                  )}
                  <Drumstick className="inline-block h-4 w-4 mr-1.5" />
                  Non-Veg
                </button>
              </div>

              {/* Meal Type cards */}
              <div className="flex items-center gap-2">
                {MEAL_TYPES.map((type) => {
                  const isActive = mealTypeFilters.has(type);
                  const iconMap = {
                    Breakfast: "🍳",
                    Lunch: "🍱",
                    Dinner: "🌙",
                  };
                  const baseClass = `relative group flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer ${isActive ? "shadow-md transform scale-105" : "shadow-sm hover:scale-[1.02]"}`;
                  const colorClasses = {
                    Breakfast: isActive
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-amber-200 bg-amber-50/50 text-amber-700 hover:border-amber-400 hover:bg-amber-50",
                    Lunch: isActive
                      ? "border-[#FF6B35] bg-orange-50 text-orange-800"
                      : "border-orange-200 bg-orange-50/50 text-orange-700 hover:border-orange-400 hover:bg-orange-50",
                    Dinner: isActive
                      ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                      : "border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-50",
                  };

                  return (
                    <button
                      key={type}
                      id={`filter-meal-${type.toLowerCase()}`}
                      onClick={() => toggleMealType(type)}
                      className={`${baseClass} ${colorClasses[type]}`}
                    >
                      <span className="text-base">{iconMap[type]}</span>
                      <span>{type}</span>
                      {isActive && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-md ring-2 ring-inset">
                          ✓
                        </span>
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
                className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 transition-all duration-300 hover:border-[#FF6B35] hover:text-[#FF6B35] hover:bg-orange-50 active:scale-95"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Reset
              </button>
            )}
          </div>

          {/* ── Build Your Own Plan Banner ── */}
          {!isAuthenticated && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-orange-100 bg-orange-50 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(255,107,53,0.08)]">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF6B35] shadow-md shadow-orange-200">
                  <PenLine className="h-5 w-5 text-white" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#FF6B35]">
                    Fully Customisable
                  </p>
                  <h3 className="mt-0.5 text-base font-black text-gray-900 sm:text-lg">
                    Build Your Own Plan
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Choose your meals, duration, and diet — we&apos;ll price it
                    just for you.
                  </p>
                </div>

                {/* CTA */}
                <button
                  id="custom-plan-cta"
                  onClick={handleCustomPlanClick}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200/60 transition-all duration-300 hover:bg-[#E85A25] hover:shadow-lg hover:shadow-orange-200/80 active:scale-[0.97]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="mb-8 flex justify-end">
              <button
                id="custom-plan-cta"
                onClick={handleCustomPlanClick}
                className="group inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200/60 transition-all duration-300 hover:bg-[#E85A25] hover:shadow-lg hover:shadow-orange-200/80 active:scale-[0.97]"
              >
                <PenLine className="h-4 w-4" />
                Build Your Own Plan
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
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

        {/* Local Favorites Section - Only for unauthenticated */}
        {!isAuthenticated && <LocalFavoritesSection className="mb-0" />}

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
      </main>

      {/* Footer - Only for unauthenticated */}
      {!isAuthenticated && <Footer />}
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <PlansContent />
    </Suspense>
  );
}
