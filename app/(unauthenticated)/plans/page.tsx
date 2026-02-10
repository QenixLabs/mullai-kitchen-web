"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand";

import { useCustomerPlans, useMenuPreview, useServiceability } from "@/api/hooks/useCustomer";
import type { PlanBrowseItem, QueryCustomerPlans, ServiceabilityResponse } from "@/api/types/customer.types";
import { FilterChips } from "@/components/customer/plans/FilterChips";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PincodeChecker } from "@/components/customer/plans/PincodeChecker";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { SearchBar } from "@/components/customer/plans/SearchBar";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { createPlanIntentStore } from "@/stores/plan-intent-store";

const DURATION_OPTIONS = ["Weekly", "Monthly"] as const;
const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;

const normalizeCsvList = (value: string | null, allowedValues: readonly string[]): string[] => {
  if (!value) {
    return [];
  }

  const allowed = new Set(allowedValues);

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item, index, list) => item.length > 0 && list.indexOf(item) === index && allowed.has(item));
};

const normalizePincode = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  return /^\d{6}$/.test(value) ? value : null;
};

const getSearchText = (plan: PlanBrowseItem): string => {
  return `${plan.name} ${plan.description ?? ""}`.toLowerCase();
};

function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const [planIntentStore] = useState(() => createPlanIntentStore());

  const persistedPincode = useStore(planIntentStore, (store) => store.checkedPincode);
  const setPlanIntent = useStore(planIntentStore, (store) => store.setPlanIntent);
  const setSourceRoute = useStore(planIntentStore, (store) => store.setSourceRoute);
  const setCheckedPincode = useStore(planIntentStore, (store) => store.setCheckedPincode);

  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") ?? "");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [selectedDurations, setSelectedDurations] = useState<string[]>(() => {
    return normalizeCsvList(searchParams.get("duration"), DURATION_OPTIONS);
  });
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(() => {
    return normalizeCsvList(searchParams.get("meals"), MEAL_TYPE_OPTIONS);
  });
  const [checkedPincodeState, setCheckedPincodeState] = useState<string | null>(() => {
    return normalizePincode(searchParams.get("pincode")) ?? persistedPincode;
  });
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);
  const [menuPlan, setMenuPlan] = useState<PlanBrowseItem | null>(null);
  const [isMenuSheetOpen, setIsMenuSheetOpen] = useState(false);

  const syncUrlState = useCallback(
    (nextState: {
      q?: string | null;
      duration?: string[];
      meals?: string[];
      pincode?: string | null;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextState.q !== undefined) {
        if (nextState.q && nextState.q.trim().length > 0) {
          params.set("q", nextState.q.trim());
        } else {
          params.delete("q");
        }
      }

      if (nextState.duration !== undefined) {
        if (nextState.duration.length > 0) {
          params.set("duration", nextState.duration.join(","));
        } else {
          params.delete("duration");
        }
      }

      if (nextState.meals !== undefined) {
        if (nextState.meals.length > 0) {
          params.set("meals", nextState.meals.join(","));
        } else {
          params.delete("meals");
        }
      }

      if (nextState.pincode !== undefined) {
        if (nextState.pincode) {
          params.set("pincode", nextState.pincode);
        } else {
          params.delete("pincode");
        }
      }

      const queryString = params.toString();
      router.replace(queryString.length > 0 ? `/plans?${queryString}` : "/plans", { scroll: false });
    },
    [router, searchParams],
  );

  const queryDuration = selectedDurations.length === 1 ? selectedDurations[0] : undefined;

  const planQueryParams = useMemo<QueryCustomerPlans>(() => {
    return {
      duration: queryDuration,
      meal_types: selectedMealTypes.length > 0 ? selectedMealTypes : undefined,
      pincode: checkedPincodeState ?? undefined,
    };
  }, [checkedPincodeState, queryDuration, selectedMealTypes]);

  const plansQuery = useCustomerPlans(planQueryParams);
  const serviceabilityMutation = useServiceability();

  const menuPreviewQuery = useMenuPreview(menuPlan?._id);

  const plans = plansQuery.data?.plans ?? [];
  const selectedPlanId = useStore(planIntentStore, (store) => store.planId);

  const filteredPlans = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch = normalizedSearch.length === 0 || getSearchText(plan).includes(normalizedSearch);
      const matchesDuration = selectedDurations.length === 0 || selectedDurations.includes(plan.duration);

      return matchesSearch && matchesDuration;
    });
  }, [plans, searchQuery, selectedDurations]);

  const handleDurationChange = (durations: string[]) => {
    setSelectedDurations(durations);
    syncUrlState({ duration: durations });
  };

  const handleMealTypeChange = (mealTypes: string[]) => {
    setSelectedMealTypes(mealTypes);
    syncUrlState({ meals: mealTypes });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    syncUrlState({ q: value });
  };

  const handlePincodeCheck = async (pincode: string): Promise<ServiceabilityResponse> => {
    return serviceabilityMutation.mutateAsync({ pincode });
  };

  const handlePincodeResult = (result: ServiceabilityResponse, pincode: string) => {
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
    setSelectingPlanId(plan._id);

    setPlanIntent(plan._id, plan);
    setCheckedPincode(checkedPincodeState);

    const currentSearch = searchParams.toString();
    setSourceRoute(currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans");

    const isSignedIn = hasHydrated && isAuthenticated;
    router.push(isSignedIn ? "/checkout" : "/auth/signin?redirect=/checkout");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">Mullai Kitchen Plans</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Choose a meal plan that fits your week</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
          Browse flexible plans, preview menus, and save your selection for quick checkout.
        </p>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <SearchBar
          value={searchInput}
          onValueChange={handleSearchChange}
          onSearch={handleSearch}
          placeholder="Search by plan name or description"
          className="w-full"
        />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <FilterChips
          selectedDurations={selectedDurations}
          selectedMealTypes={selectedMealTypes}
          onDurationChange={handleDurationChange}
          onMealTypeChange={handleMealTypeChange}
        />

        <PincodeChecker
          onCheck={handlePincodeCheck}
          onCheckResult={handlePincodeResult}
          initialPincode={checkedPincodeState ?? ""}
        />
      </section>

      <section className="mt-6">
        <PlanGrid
          plans={filteredPlans}
          onViewMenu={handleViewMenu}
          onSelectPlan={handleSelectPlan}
          isLoading={plansQuery.isLoading}
          isError={plansQuery.isError}
          errorMessage={plansQuery.error instanceof Error ? plansQuery.error.message : undefined}
          selectingPlanId={selectingPlanId}
          selectedPlanId={selectedPlanId}
        />
      </section>

      <MenuPreviewSheet
        open={isMenuSheetOpen}
        onOpenChange={setIsMenuSheetOpen}
        planName={menuPlan?.name}
        menu={menuPreviewQuery.data?.menu}
        isLoading={menuPreviewQuery.isLoading}
        isError={menuPreviewQuery.isError}
        errorMessage={menuPreviewQuery.error instanceof Error ? menuPreviewQuery.error.message : undefined}
        onRetry={() => {
          void menuPreviewQuery.refetch();
        }}
      />
    </main>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <PlansContent />
    </Suspense>
  );
}
