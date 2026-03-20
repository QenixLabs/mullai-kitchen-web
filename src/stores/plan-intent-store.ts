
import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import type { PlanBrowseItem } from "@/api/types/customer.types";

export type MealType = "Breakfast" | "Lunch" | "Dinner";

export interface PlanIntentState {
  planId: string | null;
  plan: PlanBrowseItem | null;
  sourceRoute: string | null;
  checkedPincode: string | null;
  opt_out_dates: string[];

  // Meal type and address selection
  selectedMealType: MealType | null;
  selectedAddressId: string | null;
  // Track user's preferred address per meal type
  mealTypeAddressPreferences: Record<MealType, string | null>;

  setPlanIntent: (planId: string, plan: PlanBrowseItem) => void;
  clearIntent: () => void;
  setSourceRoute: (route: string | null) => void;
  setCheckedPincode: (pincode: string | null) => void;
  setOptOutDates: (dates: string[]) => void;

  // New actions for meal type and address selection
  setSelectedMealType: (mealType: MealType | null) => void;
  setSelectedAddressId: (addressId: string | null) => void;
  setMealTypeAddressPreference: (mealType: MealType, addressId: string) => void;
  clearMealAndAddressSelections: () => void;
}

const defaultPlanIntentState: Pick<
  PlanIntentState,
  | "planId"
  | "plan"
  | "sourceRoute"
  | "checkedPincode"
  | "opt_out_dates"
  | "selectedMealType"
  | "selectedAddressId"
  | "mealTypeAddressPreferences"
> = {
  planId: null,
  plan: null,
  sourceRoute: null,
  checkedPincode: null,
  opt_out_dates: [],
  selectedMealType: null,
  selectedAddressId: null,
  mealTypeAddressPreferences: {
    Breakfast: null,
    Lunch: null,
    Dinner: null,
  },
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
      (set) => ({
        planId: initialState.planId ?? defaultPlanIntentState.planId,
        plan: initialState.plan ?? defaultPlanIntentState.plan,
        sourceRoute: initialState.sourceRoute ?? defaultPlanIntentState.sourceRoute,
        checkedPincode: initialState.checkedPincode ?? defaultPlanIntentState.checkedPincode,
        opt_out_dates: initialState.opt_out_dates ?? defaultPlanIntentState.opt_out_dates,
        selectedMealType: initialState.selectedMealType ?? defaultPlanIntentState.selectedMealType,
        selectedAddressId: initialState.selectedAddressId ?? defaultPlanIntentState.selectedAddressId,
        mealTypeAddressPreferences: initialState.mealTypeAddressPreferences ?? defaultPlanIntentState.mealTypeAddressPreferences,

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
            selectedMealType: null,
            selectedAddressId: null,
            // Note: We preserve mealTypeAddressPreferences for user convenience
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

        // New actions for meal type and address selection
        setSelectedMealType: (mealType: MealType | null) => {
          set({ selectedMealType: mealType });
        },
        setSelectedAddressId: (addressId: string | null) => {
          set({ selectedAddressId: addressId });
        },
        setMealTypeAddressPreference: (mealType: MealType, addressId: string) => {
          set((state) => ({
            mealTypeAddressPreferences: {
              ...state.mealTypeAddressPreferences,
              [mealType]: addressId,
            },
          }));
        },
        clearMealAndAddressSelections: () => {
          set({
            selectedMealType: null,
            selectedAddressId: null,
          });
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
          selectedMealType: state.selectedMealType,
          selectedAddressId: state.selectedAddressId,
          mealTypeAddressPreferences: state.mealTypeAddressPreferences,
        }),
      },
    ),
  );
};
