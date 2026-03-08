import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import type { PlanBrowseItem } from "@/api/types/customer.types";

export interface PlanIntentState {
  planId: string | null;
  plan: PlanBrowseItem | null;
  sourceRoute: string | null;
  checkedPincode: string | null;
  opt_out_dates: string[];

  setPlanIntent: (planId: string, plan: PlanBrowseItem) => void;
  clearIntent: () => void;
  setSourceRoute: (route: string | null) => void;
  setCheckedPincode: (pincode: string | null) => void;
  setOptOutDates: (dates: string[]) => void;
}

const defaultPlanIntentState: Pick<
  PlanIntentState,
  "planId" | "plan" | "sourceRoute" | "checkedPincode" | "opt_out_dates"
> = {
  planId: null,
  plan: null,
  sourceRoute: null,
  checkedPincode: null,
  opt_out_dates: [],
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const getSessionStorage = (): StateStorage => {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  return window.sessionStorage;
};

export const createPlanIntentStore = (
  initialState: Partial<PlanIntentState> = {},
) => {
  return createStore<PlanIntentState>()(
    persist(
      (set: (partial: Partial<PlanIntentState>) => void) => ({
        planId: initialState.planId ?? defaultPlanIntentState.planId,
        plan: initialState.plan ?? defaultPlanIntentState.plan,
        sourceRoute: initialState.sourceRoute ?? defaultPlanIntentState.sourceRoute,
        checkedPincode: initialState.checkedPincode ?? defaultPlanIntentState.checkedPincode,
        opt_out_dates: initialState.opt_out_dates ?? defaultPlanIntentState.opt_out_dates,
        setPlanIntent: (planId: string, plan: PlanBrowseItem) => {
          set({
            planId,
            plan,
          });
        },
        clearIntent: () => {
          set({
            planId: null,
            plan: null,
            sourceRoute: null,
            checkedPincode: null,
            opt_out_dates: [],
          });
        },
        setSourceRoute: (route: string | null) => {
          set({ sourceRoute: route });
        },
        setCheckedPincode: (pincode: string | null) => {
          set({ checkedPincode: pincode });
        },
        setOptOutDates: (dates: string[]) => {
          set({ opt_out_dates: dates });
        },
      }),
      {
        name: "mk-plan-intent-store",
        storage: createJSONStorage(getSessionStorage),
        partialize: (state: PlanIntentState) => ({
          planId: state.planId,
          plan: state.plan,
          sourceRoute: state.sourceRoute,
          checkedPincode: state.checkedPincode,
          opt_out_dates: state.opt_out_dates,
        }),
      },
    ),
  );
};
