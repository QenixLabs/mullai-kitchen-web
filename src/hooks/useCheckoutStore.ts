import { useMemo } from "react";

import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";

export function useCheckoutPlan() {
  return usePlanIntentStore((store) => ({
    planId: store.planId,
    plan: store.plan,
    hasPlanIntent: Boolean(store.planId && store.plan),
  }));
}

export function useCheckoutPlanId() {
  return usePlanIntentStore((store) => store.planId);
}

export function useCheckoutPlanData() {
  return usePlanIntentStore((store) => store.plan);
}

export function useHasCheckoutPlanIntent() {
  const planId = usePlanIntentStore((store) => store.planId);
  const plan = usePlanIntentStore((store) => store.plan);
  return useMemo(() => Boolean(planId && plan), [planId, plan]);
}
