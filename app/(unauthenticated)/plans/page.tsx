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
import Header from "@/components/customer/layout/Header";
import Footer from "@/components/customer/layout/Footer";
import { HeroSection } from "@/components/customer/plans/HeroSection";
import { HowItWorksSection } from "@/components/customer/plans/HowItWorksSection";
import { LocalFavoritesSection } from "@/components/customer/plans/LocalFavoritesSection";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { CustomPlanBuilderDialog } from "@/components/customer/plans/CustomPlanBuilderDialog";
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
  const [isCustomPlanOpen, setIsCustomPlanOpen] = useState(false);

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
    const isSignedIn = hasHydrated && isAuthenticated;
    if (!isSignedIn) {
      const currentSearch = searchParams.toString();
      const from =
        currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans";
      router.push(`/auth/signin?redirect=${encodeURIComponent(from)}`);
      return;
    }
    setIsCustomPlanOpen(true);
  };

  const handleCustomPlanCreated = (plan: PlanBrowseItem) => {
    setPlanIntent(plan._id, plan);
    setCheckedPincode(checkedPincodeState);
    const currentSearch = searchParams.toString();
    setSourceRoute(
      currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans",
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Hero Section */}
        <HeroSection
          onPincodeCheck={handlePincodeCheck}
          onPincodeResult={handlePincodeResult}
          initialPincode={checkedPincodeState ?? ""}
          className="mb-10"
        />

        {/* How It Works Section */}
        <HowItWorksSection className="mb-12" />

        {/* Plans Section */}
        <section className="mb-8 sm:mb-12">
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
            <div className="flex items-center gap-3">
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
          </div>

          {/* ── Filter Bar ── */}
          <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Veg / Non-Veg toggle */}
            <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                id="filter-diet-all"
                onClick={() => setDietFilter("all")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  dietFilter === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                All
              </button>
              <button
                id="filter-diet-veg"
                onClick={() => setDietFilter("veg")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  dietFilter === "veg"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-green-700"
                }`}
              >
                <Leaf className="h-3 w-3" />
                Veg
              </button>
              <button
                id="filter-diet-nonveg"
                onClick={() => setDietFilter("non-veg")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  dietFilter === "non-veg"
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-red-600"
                }`}
              >
                <Drumstick className="h-3 w-3" />
                Non-Veg
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200" />

            {/* Meal Type chips */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                <UtensilsCrossed className="h-3 w-3" />
                Meal
              </span>
              {MEAL_TYPES.map((type) => {
                const isActive = mealTypeFilters.has(type);
                const colorMap: Record<string, string> = {
                  Breakfast: isActive
                    ? "bg-amber-500 text-white border-amber-500"
                    : "border-amber-200 text-amber-700 hover:bg-amber-50",
                  Lunch: isActive
                    ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                    : "border-orange-200 text-orange-700 hover:bg-orange-50",
                  Dinner: isActive
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-indigo-200 text-indigo-700 hover:bg-indigo-50",
                };
                return (
                  <button
                    key={type}
                    id={`filter-meal-${type.toLowerCase()}`}
                    onClick={() => toggleMealType(type)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      colorMap[type]
                    }`}
                  >
                    {isActive && (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/25 text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Clear filters */}
            {(dietFilter !== "all" || mealTypeFilters.size > 0) && (
              <button
                id="filter-clear"
                onClick={() => {
                  setDietFilter("all");
                  setMealTypeFilters(new Set());
                }}
                className="ml-auto text-xs font-medium text-gray-400 underline-offset-2 hover:text-[#FF6B35] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* ── Build Your Own Plan Banner ── */}
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

        {/* Local Favorites Section */}
        <LocalFavoritesSection className="mb-0" />

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

        {/* Custom Plan Builder Dialog */}
        <CustomPlanBuilderDialog
          open={isCustomPlanOpen}
          onOpenChange={setIsCustomPlanOpen}
          onPlanCreated={handleCustomPlanCreated}
          checkedPincode={checkedPincodeState}
        />
      </main>

      <Footer />
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
