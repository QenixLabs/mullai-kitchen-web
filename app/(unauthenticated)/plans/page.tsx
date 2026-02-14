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
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { Sparkles, ChevronRight } from "lucide-react";
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

  const syncUrlState = useCallback(
    (nextState: {
      pincode?: string | null;
    }) => {
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
          <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
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
                {plans.length} plan{plans.length !== 1 ? "s" : ""} available
              </span>
              {/* Swipe hint for mobile */}
              <span className="flex items-center gap-1 text-xs text-gray-400 sm:hidden">
                Swipe to browse
                <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          <PlanGrid
            plans={plans}
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
