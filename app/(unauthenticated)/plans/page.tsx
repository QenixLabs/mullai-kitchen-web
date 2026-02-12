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
import { FilterChips } from "@/components/customer/plans/FilterChips";
import { HeroSection } from "@/components/customer/plans/HeroSection";
import { MenuPreviewSheet } from "@/components/customer/plans/MenuPreviewSheet";
import { PlanGrid } from "@/components/customer/plans/PlanGrid";
import { SearchBar } from "@/components/customer/plans/SearchBar";
import { WhyChooseSection } from "@/components/customer/plans/WhyChooseSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { Sparkles } from "lucide-react";
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
    setPlanIntent(plan._id, plan);
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
      <HeroSection
        onPincodeCheck={handlePincodeCheck}
        onPincodeResult={handlePincodeResult}
        initialPincode={checkedPincodeState ?? ""}
        className="mb-10"
      />

      <section className="mb-10 space-y-4">
        <Card className="rounded-2xl border-orange-100 bg-white shadow-[0_14px_38px_-34px_rgba(15,23,42,0.65)]">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <SearchBar
                  value={searchInput}
                  onValueChange={handleSearchChange}
                  onSearch={handleSearch}
                  placeholder="Search by plan name or description"
                  className="w-full"
                />
              </div>

                {(activeFilterCount > 0 || hasSearch) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {hasSearch && (
                    <span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-medium text-sky-800">
                      Search active
                    </span>
                    )}
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-800">
                      {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                    </span>
                  )}
                  {(hasSearch || activeFilterCount > 0) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full border border-orange-200 bg-white text-xs text-gray-700 hover:bg-orange-50"
                      onClick={() => {
                        if (hasSearch) handleClearSearch();
                        if (activeFilterCount > 0) {
                          handleDurationChange([]);
                          handleMealTypeChange([]);
                        }
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>

            <FilterChips
              selectedDurations={selectedDurations}
              selectedMealTypes={selectedMealTypes}
              onDurationChange={handleDurationChange}
              onMealTypeChange={handleMealTypeChange}
              layout="horizontal"
              className="flex-wrap"
            />
          </CardContent>
        </Card>
      </section>

      <section className="mb-4">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              <Sparkles className="h-3.5 w-3.5" />
              curated plans
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Choose your meal plan
            </h2>
          </div>
          <p className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-sm font-medium text-gray-700">
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""}
          </p>
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
          className="xl:grid-cols-3"
        />

        {!checkedPincodeState && !plansQuery.isLoading && filteredPlans.length > 0 && (
          <Alert className="mt-6 rounded-xl border-amber-200 bg-amber-50 text-amber-800">
            <AlertTitle>Verify your pincode</AlertTitle>
            <AlertDescription>
              Please check your pincode above to see plans available in your area and proceed to checkout.
            </AlertDescription>
          </Alert>
        )}
      </section>

      <WhyChooseSection className="mt-12" />
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
