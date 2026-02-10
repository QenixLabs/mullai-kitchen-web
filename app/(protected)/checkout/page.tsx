"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useStore } from "zustand";

import { AddressPlaceholder } from "@/components/customer/checkout/AddressPlaceholder";
import { CheckoutShell } from "@/components/customer/checkout/CheckoutShell";
import { ReviewPlaceholder } from "@/components/customer/checkout/ReviewPlaceholder";
import { StartDatePlaceholder } from "@/components/customer/checkout/StartDatePlaceholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { createPlanIntentStore } from "@/stores/plan-intent-store";

export default function CheckoutPage() {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const [planIntentStore] = useState(() => createPlanIntentStore());

  const planId = useStore(planIntentStore, (store) => store.planId);
  const plan = useStore(planIntentStore, (store) => store.plan);
  const sourceRoute = useStore(planIntentStore, (store) => store.sourceRoute);
  const checkedPincode = useStore(planIntentStore, (store) => store.checkedPincode);

  const hasPlanIntent = Boolean(planId && plan);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/signin?redirect=/checkout");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) {
      return;
    }

    if (!hasPlanIntent) {
      router.replace("/plans");
    }
  }, [hasHydrated, hasPlanIntent, isAuthenticated, router]);

  if (!hasHydrated) {
    return <div className="p-6 text-sm text-slate-600">Preparing your checkout session...</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-6 text-sm text-slate-600">Redirecting to sign in...</div>;
  }

  if (!hasPlanIntent || !plan) {
    return <div className="p-6 text-sm text-slate-600">Redirecting to plans...</div>;
  }

  return (
    <CheckoutShell currentStep={0} plan={plan} checkedPincode={checkedPincode} sourceRoute={sourceRoute}>
      <Card className="border-orange-200 bg-orange-50/70 py-4 shadow-sm">
        <CardHeader className="space-y-2 px-5 pb-0 sm:px-6">
          <span className="w-fit rounded-full bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white">Selected plan</span>
          <CardTitle className="text-lg font-bold text-gray-900 sm:text-xl">{plan.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 sm:px-6">
          <p className="text-sm text-gray-700">You are checking out with your chosen plan. Address and schedule steps are ready in Phase 2.</p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-700">
            <span className="rounded-full bg-white px-2.5 py-1 font-medium">Duration: {plan.duration}</span>
            <span className="rounded-full bg-white px-2.5 py-1 font-medium">Meals: {plan.meals_included.length}</span>
          </div>
        </CardContent>
      </Card>

      <AddressPlaceholder />
      <StartDatePlaceholder />
      <ReviewPlaceholder />

      <Card className="border-gray-200 bg-white py-4 shadow-sm">
        <CardHeader className="px-5 pb-0 sm:px-6">
          <CardTitle className="inline-flex items-center gap-2 text-base font-semibold text-gray-900">
            <ShoppingBag className="h-4 w-4 text-orange-600" aria-hidden="true" />
            Payment handoff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 sm:px-6">
          <p className="text-sm text-gray-600">Proceed to payment is intentionally disabled in Phase 1. Order creation and payment flow arrive in Phase 2.</p>
          <Button disabled className="h-11 w-full rounded-lg bg-orange-600 font-semibold text-white sm:w-auto" type="button">
            Proceed to payment
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </CheckoutShell>
  );
}
