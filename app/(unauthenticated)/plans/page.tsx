"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand";
import { Clock3, MapPin, Salad, Sparkles } from "lucide-react";

import { useCustomerPlans, useMenuPreview, useServiceability } from "@/api/hooks/useCustomer";
import type { PlanBrowseItem, QueryCustomerPlans, ServiceabilityResponse } from "@/api/types/customer.types";
import { FilterChips } from "@/components/customer/plans/FilterChips";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PincodeChecker } from "@/components/customer/plans/PincodeChecker";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { SearchBar } from "@/components/customer/plans/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
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

  const plans = useMemo(() => plansQuery.data?.plans ?? [], [plansQuery.data?.plans]);
  const selectedPlanId = useStore(planIntentStore, (store) => store.planId);

  const filteredPlans = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch = normalizedSearch.length === 0 || getSearchText(plan).includes(normalizedSearch);
      const matchesDuration = selectedDurations.length === 0 || selectedDurations.includes(plan.duration);

      return matchesSearch && matchesDuration;
    });
  }, [plans, searchQuery, selectedDurations]);

  const activeFilterCount = selectedDurations.length + selectedMealTypes.length + (checkedPincodeState ? 1 : 0);
  const hasSearch = searchQuery.trim().length > 0;

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
    <main className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute -top-20 -left-24 h-64 w-64 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />

      <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-100 via-orange-50 to-amber-100 p-5 shadow-sm sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Mullai Kitchen Plans</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Fresh Meals, Crafted for Your Week
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-700 sm:text-base">
              Explore balanced meal plans, preview each menu, and pick what works best for your routine.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-800">Chef-curated menus</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-800">Flexible durations</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-800">Quick checkout flow</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:min-w-52">
            <Card className="border-orange-200/70 bg-white/80">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-orange-100 p-2 text-orange-700">
                  <Salad className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available plans</p>
                  <p className="text-sm font-semibold text-gray-900">{plans.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200/70 bg-white/80">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-orange-100 p-2 text-orange-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Visible now</p>
                  <p className="text-sm font-semibold text-gray-900">{filteredPlans.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200/70 bg-white/80">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-orange-100 p-2 text-orange-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivery check</p>
                  <p className="text-sm font-semibold text-gray-900">{checkedPincodeState ? "Enabled" : "Pending"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(300px,360px)_1fr] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card className="border-orange-100 bg-white/90">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Search and filter</p>
                  <p className="text-sm text-gray-700">Find a plan in seconds</p>
                </div>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">
                    {activeFilterCount} active
                  </span>
                ) : null}
              </div>

              <SearchBar
                value={searchInput}
                onValueChange={handleSearchChange}
                onSearch={handleSearch}
                placeholder="Search by plan name or description"
                className="w-full"
              />
            </CardContent>
          </Card>

          <FilterChips
            selectedDurations={selectedDurations}
            selectedMealTypes={selectedMealTypes}
            onDurationChange={handleDurationChange}
            onMealTypeChange={handleMealTypeChange}
            className="border-orange-100 bg-white/90"
          />

          <PincodeChecker
            onCheck={handlePincodeCheck}
            onCheckResult={handlePincodeResult}
            initialPincode={checkedPincodeState ?? ""}
            className="border-orange-100 bg-white/90"
          />
        </aside>

        <section className="space-y-4">
          <Card className="border-orange-100 bg-white/90">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Plan Menu</h2>
                <p className="text-sm text-gray-600">
                  {plansQuery.isLoading
                    ? "Loading plans..."
                    : `${filteredPlans.length} plan${filteredPlans.length === 1 ? "" : "s"} matching your preferences`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasSearch ? (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    Search applied
                  </span>
                ) : null}
                {checkedPincodeState ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {checkedPincodeState}
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    Pincode not verified
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <PlanGrid
            plans={filteredPlans}
            onViewMenu={handleViewMenu}
            onSelectPlan={handleSelectPlan}
            isLoading={plansQuery.isLoading}
            isError={plansQuery.isError}
            errorMessage={plansQuery.error instanceof Error ? plansQuery.error.message : undefined}
            selectingPlanId={selectingPlanId}
            selectedPlanId={selectedPlanId}
            className="xl:grid-cols-2 2xl:grid-cols-3"
          />
        </section>
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
