"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "zustand";
import {
  ListFilter,
  MapPin,
  Search,
} from "lucide-react";

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
import { FilterChips } from "@/components/customer/plans/FilterChips";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PlanDetailsPanel } from "@/components/customer/plans/PlanDetailsPanel";
import { PincodeChecker } from "@/components/customer/plans/PincodeChecker";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { SearchBar } from "@/components/customer/plans/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { createPlanIntentStore } from "@/stores/plan-intent-store";

const DURATION_OPTIONS = ["Weekly", "Monthly"] as const;
const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner"] as const;

const normalizeCsvList = (
  value: string | null,
  allowedValues: readonly string[],
): string[] => {
  if (!value) {
    return [];
  }

  const allowed = new Set(allowedValues);

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(
      (item, index, list) =>
        item.length > 0 && list.indexOf(item) === index && allowed.has(item),
    );
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

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [selectedDurations, setSelectedDurations] = useState<string[]>(() => {
    return normalizeCsvList(searchParams.get("duration"), DURATION_OPTIONS);
  });
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(() => {
    return normalizeCsvList(searchParams.get("meals"), MEAL_TYPE_OPTIONS);
  });
  const [checkedPincodeState, setCheckedPincodeState] = useState<string | null>(
    () => {
      return normalizePincode(searchParams.get("pincode")) ?? persistedPincode;
    },
  );
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
      router.replace(
        queryString.length > 0 ? `/plans?${queryString}` : "/plans",
        { scroll: false },
      );
    },
    [router, searchParams],
  );

  const queryDuration =
    selectedDurations.length === 1 ? selectedDurations[0] : undefined;

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

  const plans = useMemo(
    () => plansQuery.data?.plans ?? [],
    [plansQuery.data?.plans],
  );
  const selectedPlanId = useStore(planIntentStore, (store) => store.planId);
  const [selectedPlanForDetailsId, setSelectedPlanForDetailsId] = useState<
    string | null
  >(null);

  const filteredPlans = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        getSearchText(plan).includes(normalizedSearch);
      const matchesDuration =
        selectedDurations.length === 0 ||
        selectedDurations.includes(plan.duration);

      return matchesSearch && matchesDuration;
    });
  }, [plans, searchQuery, selectedDurations]);

  const activeFilterCount =
    selectedDurations.length +
    selectedMealTypes.length +
    (checkedPincodeState ? 1 : 0);
  const hasSearch = searchQuery.trim().length > 0;

  const selectedPlanForDetails = useMemo(() => {
    if (filteredPlans.length === 0) {
      return null;
    }

    const preferredPlanId = selectedPlanForDetailsId ?? selectedPlanId;

    if (!preferredPlanId) {
      return filteredPlans[0];
    }

    return (
      filteredPlans.find((plan) => plan._id === preferredPlanId) ??
      filteredPlans[0]
    );
  }, [filteredPlans, selectedPlanForDetailsId, selectedPlanId]);

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

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    syncUrlState({ q: null });
  };

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
    setSelectedPlanForDetailsId(plan._id);
    setPlanIntent(plan._id, plan);
    setCheckedPincode(checkedPincodeState);

    const currentSearch = searchParams.toString();
    setSourceRoute(
      currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans",
    );
  };

  const handleProceedToCheckout = () => {
    if (!selectedPlanForDetails) {
      return;
    }

    setSelectingPlanId(selectedPlanForDetails._id);

    setPlanIntent(selectedPlanForDetails._id, selectedPlanForDetails);
    setCheckedPincode(checkedPincodeState);

    const currentSearch = searchParams.toString();
    setSourceRoute(
      currentSearch.length > 0 ? `/plans?${currentSearch}` : "/plans",
    );

    const isSignedIn = hasHydrated && isAuthenticated;
    router.push(isSignedIn ? "/checkout" : "/auth/signin?redirect=/checkout");
  };

  return (
    <main className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-[url('/images/plan_bg.png')] bg-cover bg-center p-5 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-white/60 via-white/35 to-transparent" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.75)]">
              Mullai Kitchen Plans
            </p>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 [text-shadow:0_2px_4px_rgba(255,255,255,0.75)] sm:text-3xl lg:text-4xl">
              Fresh Meals, Crafted for Your Week
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold text-slate-900 [text-shadow:0_1px_3px_rgba(255,255,255,0.7)] sm:text-base">
              Explore balanced meal plans, preview each menu, and pick what
              works best for your routine.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900">
                Chef-curated menus
              </span>
              <span className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900">
                Flexible durations
              </span>
              <span className="rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900">
                Quick checkout flow
              </span>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:min-w-52">
            <Card className="border-orange-200/80 bg-white/85 shadow-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-orange-100 p-2 text-orange-700">
                  <Salad className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Available plans</p>
                  <p className="text-sm font-bold text-slate-950">
                    {plans.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200/80 bg-white/85 shadow-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-orange-100 p-2 text-orange-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Visible now</p>
                  <p className="text-sm font-bold text-slate-950">
                    {filteredPlans.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-orange-200/80 bg-white/85 shadow-sm">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="rounded-md bg-orange-100 p-2 text-orange-700">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Delivery check</p>
                  <p className="text-sm font-bold text-slate-950">
                    {checkedPincodeState ? "Enabled" : "Pending"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(300px,360px)]">
        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card className="border-orange-100 bg-white/90">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                    <ListFilter className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Search and filter
                    </p>
                    <p className="text-sm text-gray-700">
                      Refine plans by keyword, duration, and meal type
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterCount > 0 ? (
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800">
                      {activeFilterCount} active
                    </span>
                  ) : null}
                  {hasSearch ? (
                    <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800">
                      <Search className="mr-1 h-3.5 w-3.5" />
                      Keyword set
                    </span>
                  ) : null}
                </div>
              </div>

              <SearchBar
                value={searchInput}
                onValueChange={handleSearchChange}
                onSearch={handleSearch}
                placeholder="Search by plan name or description"
                className="w-full"
              />

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-orange-100 bg-orange-50/70 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                    Filters
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {activeFilterCount}
                  </p>
                </div>
                <div className="rounded-lg border border-orange-100 bg-orange-50/70 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                    Search
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {hasSearch ? "Active" : "Off"}
                  </p>
                </div>
                <div className="rounded-lg border border-orange-100 bg-orange-50/70 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                    Pincode
                  </p>
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {checkedPincodeState ?? "Not set"}
                  </p>
                </div>
              </div>

              {hasSearch ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-center rounded-full border border-orange-200/80 bg-white/80 text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-800"
                  onClick={handleClearSearch}
                >
                  Clear search keyword
                </Button>
              ) : null}
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Plan Menu
                </h2>
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
            errorMessage={
              plansQuery.error instanceof Error
                ? plansQuery.error.message
                : undefined
            }
            selectingPlanId={selectingPlanId}
            selectedPlanId={selectedPlanForDetails?._id ?? selectedPlanId}
            className="xl:grid-cols-2"
          />
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <PlanDetailsPanel
            plan={selectedPlanForDetails}
            checkedPincode={checkedPincodeState}
            onProceedToCheckout={handleProceedToCheckout}
            onViewMenu={() => {
              if (!selectedPlanForDetails) {
                return;
              }

              handleViewMenu(selectedPlanForDetails);
            }}
            isCheckingOut={Boolean(
              selectedPlanForDetails &&
              selectingPlanId === selectedPlanForDetails._id,
            )}
          />
        </aside>
      </section>

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
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <PlansContent />
    </Suspense>
  );
}
