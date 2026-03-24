"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useUserStore";
import { ArrowRight, ChevronDown } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { cn } from "@/lib/utils";
import { AddressSelectionModal } from "@/components/customer/profile/AddressSelectionModal";

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
  const setSelectedMealType = usePlanIntentStore((store) => store.setSelectedMealType);
  const setSelectedAddressId = usePlanIntentStore((store) => store.setSelectedAddressId);

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
  const [mealTypeOpen, setMealTypeOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [durationFilter, setDurationFilter] = useState<string[]>([]);
  const mealTypeRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);

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

  const toggleDuration = (d: string) => {
    setDurationFilter((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mealTypeRef.current && !mealTypeRef.current.contains(e.target as Node)) {
        setMealTypeOpen(false);
      }
      if (durationRef.current && !durationRef.current.contains(e.target as Node)) {
        setDurationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    // Duration filter
    if (durationFilter.length > 0) {
      result = result.filter((p) =>
        durationFilter.some((d) =>
          p.duration.toLowerCase().includes(d.toLowerCase()),
        ),
      );
    }

    return result;
  }, [plans, mealTypeFilters, durationFilter]);
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
    // Meal type and address selection now happens in checkout
    // Clear any previous selections
    setSelectedMealType(null);
    setSelectedAddressId(null);

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
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Choose Your Perfect Plan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Select a plan that fits your routine. You can pause or cancel anytime.
          </p>
        </div>

        {/* ── Build Your Own Plan Banner ── */}
        {showBuildYourOwnBanner && (
          <div className="mb-8 rounded-xl bg-card border border-border shadow-sm overflow-visible relative">
            <div className="flex items-center gap-6 pl-6 pr-0 py-6">
              {/* Left content */}
              <div className="flex items-start gap-4 flex-1 py-2">
                {/* Bell icon */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Image src="/images/plans/bell.png" alt="" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Build Your Own Plan</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose your meals, duration, and diet — we&apos;ll price it just for you.
                  </p>
                  <button
                    id="custom-plan-cta"
                    onClick={handleCustomPlanClick}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Start Customizing
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* Right decorative image — overflows card vertically */}
              <div className="hidden lg:block shrink-0 w-72 self-stretch relative overflow-visible">
                <Image
                  src="/images/plans/ownplan.png"
                  alt="Build your own meal plan"
                  fill
                  className="h-[160%]! top-auto! bottom-0 left-1/2 -translate-x-1/2 object-contain object-bottom"
                />
              </div>
            </div>
          </div>
        )}

        {/* Popular Plans heading */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Popular Plans</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pause anytime | Tailored for you | 5000+ meal delivered weekly
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">

          {/* "All" pill — standalone, dark when active */}
          <button
            onClick={() => setDietFilter("all")}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-all",
              dietFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground border border-border hover:bg-primary/10",
            )}
          >
            All
          </button>

          {/* Veg + Non-Veg grouped in one white pill */}
          <div className="flex items-center overflow-hidden rounded-full border border-border bg-card">
            <button
              onClick={() => setDietFilter(dietFilter === "veg" ? "all" : "veg")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all",
                dietFilter === "veg"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {/* outlined circle with green dot */}
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-success">
                <span className="h-2 w-2 rounded-full bg-success" />
              </span>
              Veg
            </button>
            {/* vertical divider */}
            <span className="h-5 w-px bg-border" />
            <button
              onClick={() => setDietFilter(dietFilter === "non-veg" ? "all" : "non-veg")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all",
                dietFilter === "non-veg"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {/* outlined circle with red dot */}
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-destructive">
                <span className="h-2 w-2 rounded-full bg-destructive" />
              </span>
              Non-Veg
            </button>
          </div>

          {/* Meal Type dropdown — always dark primary */}
          <div className="relative" ref={mealTypeRef}>
            <button
              onClick={() => setMealTypeOpen(!mealTypeOpen)}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Meal Type
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {mealTypeOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 w-40 rounded-lg bg-card border border-border shadow-md p-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleMealType(type)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      mealTypeFilters.has(type)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {mealTypeFilters.has(type) && <FaCheck className="h-3 w-3" />}
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration dropdown — always dark primary */}
          <div className="relative" ref={durationRef}>
            <button
              onClick={() => setDurationOpen(!durationOpen)}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Duration
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {durationOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 w-36 rounded-lg bg-card border border-border shadow-md p-2">
                {["Weekly", "Monthly"].map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDuration(d)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      durationFilter.includes(d)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {durationFilter.includes(d) && <FaCheck className="h-3 w-3" />}
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear filters */}
          {(dietFilter !== "all" || mealTypeFilters.size > 0 || durationFilter.length > 0) && (
            <button
              onClick={() => {
                setDietFilter("all");
                setMealTypeFilters(new Set());
                setDurationFilter([]);
              }}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              Reset
            </button>
          )}
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

      {/* Address Selection Modal - Now only used for custom plans */}
      <AddressSelectionModal
        open={false}
        onOpenChange={() => {}}
        onSuccess={() => {}}
      />
    </div>
  );
}
