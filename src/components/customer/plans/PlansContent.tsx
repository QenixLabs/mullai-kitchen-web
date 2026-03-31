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
        <div className="mb-5 sm:mb-6">
          <h1 className="text-3xl font-black tracking-tight text-[#44151C] sm:text-4xl">
            Choose Your Perfect Plan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Select a plan that fits your routine. You can pause or cancel anytime.
          </p>
        </div>

        {/* ── Build Your Own Plan Banner ── */}
        {showBuildYourOwnBanner && (
          <div className="relative mb-9 overflow-hidden rounded-[24px] border border-[#3D000C] bg-[#3D000C] shadow-[0_14px_30px_rgba(33,0,7,0.34)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_130%_at_0%_0%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_62%)]" />

            <div className="relative z-10 flex min-h-54 items-center px-6 py-6 sm:px-7 lg:px-8 lg:pr-88">
              <div className="w-full max-w-107.5">
                <h3 className="text-[44px] font-black leading-[0.95] tracking-tight text-[#FFFFFF] sm:text-[50px]">
                  Build Your Own Plan
                </h3>
                <p className="mt-3 max-w-105 text-[15px] leading-relaxed text-[#FFFFFF]/80">
                  Customize every bite. Tailor your meal frequency, portion
                  sizes, and dietary preferences to fit your unique lifestyle
                  perfectly.
                </p>
                <button
                  id="custom-plan-cta"
                  onClick={handleCustomPlanClick}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFFFFF] px-6 py-3 text-sm font-bold text-[#3D000C] transition-colors hover:bg-[#FFFFFF]/90"
                >
                  Start Customizing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="pointer-events-none absolute bottom-0 right-2 hidden h-56 w-80 lg:block">
                <Image
                  src="/images/plans/ownplan.png"
                  alt="Build your own meal plan"
                  fill
                  className="object-contain object-bottom"
                  priority={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Popular Plans heading + filters */}
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              className="text-[30px] font-bold leading-none text-[#371116]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Popular Plans
            </h2>
            <p className="mt-1 text-sm text-[#7B6E72]">
              Curated culinary journeys designed by our head chefs.
            </p>
          </div>

          {/* ── Filter Bar ── */}
          <div className="flex flex-wrap items-center gap-2.5 lg:justify-end lg:pt-1">

          {/* "All" pill — standalone, dark when active */}
          <button
            onClick={() => setDietFilter("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
              dietFilter === "all"
                ? "bg-[#5A1622] text-white shadow-sm"
                : "border border-[#E8E1E4] bg-white text-[#6D6064] hover:border-[#D9CFD2]",
            )}
          >
            All
          </button>

          {/* Veg + Non-Veg grouped in one white pill */}
          <div className="flex items-center overflow-hidden rounded-full border border-[#E8E1E4] bg-white">
            <button
              onClick={() => setDietFilter(dietFilter === "veg" ? "all" : "veg")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold transition-all",
                dietFilter === "veg"
                  ? "bg-[#5A1622] text-white"
                  : "text-[#6D6064] hover:bg-[#F7F3F5]",
              )}
            >
              {/* outlined circle with green dot */}
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#2F9D64]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2F9D64]" />
              </span>
              Veg
            </button>
            {/* vertical divider */}
            <span className="h-4 w-px bg-[#E8E1E4]" />
            <button
              onClick={() => setDietFilter(dietFilter === "non-veg" ? "all" : "non-veg")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold transition-all",
                dietFilter === "non-veg"
                  ? "bg-[#5A1622] text-white"
                  : "text-[#6D6064] hover:bg-[#F7F3F5]",
              )}
            >
              {/* outlined circle with red dot */}
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#C93C46]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C93C46]" />
              </span>
              Non-Veg
            </button>
          </div>

          {/* Meal Type dropdown */}
          <div className="relative" ref={mealTypeRef}>
            <button
              onClick={() => setMealTypeOpen(!mealTypeOpen)}
              className="flex items-center gap-1.5 rounded-full border border-[#E8E1E4] bg-white px-4 py-1.5 text-xs font-semibold text-[#4A3E42] transition-colors hover:border-[#D9CFD2]"
            >
              Meal Type
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {mealTypeOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-xl border border-[#E6DFE2] bg-white p-2 shadow-md">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleMealType(type)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      mealTypeFilters.has(type)
                        ? "bg-[#F7F3F5] font-semibold text-[#5A1622]"
                        : "text-[#4A3E42] hover:bg-[#F9F6F7]",
                    )}
                  >
                    {mealTypeFilters.has(type) && <FaCheck className="h-3 w-3" />}
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration dropdown */}
          <div className="relative" ref={durationRef}>
            <button
              onClick={() => setDurationOpen(!durationOpen)}
              className="flex items-center gap-1.5 rounded-full border border-[#E8E1E4] bg-white px-4 py-1.5 text-xs font-semibold text-[#4A3E42] transition-colors hover:border-[#D9CFD2]"
            >
              Duration
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {durationOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-xl border border-[#E6DFE2] bg-white p-2 shadow-md">
                {["Weekly", "Monthly"].map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDuration(d)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors",
                      durationFilter.includes(d)
                        ? "bg-[#F7F3F5] font-semibold text-[#5A1622]"
                        : "text-[#4A3E42] hover:bg-[#F9F6F7]",
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
              className="rounded-full border border-[#E8E1E4] px-4 py-1.5 text-xs font-semibold text-[#7B6E72] transition-colors hover:border-[#D9CFD2] hover:text-[#5A1622]"
            >
              Reset
            </button>
          )}
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
          className="mt-1"
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
