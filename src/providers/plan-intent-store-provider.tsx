"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { useStore } from "zustand";

import { createPlanIntentStore, type PlanIntentState } from "@/stores/plan-intent-store";

type PlanIntentStoreApi = ReturnType<typeof createPlanIntentStore>;

const PlanIntentStoreContext = createContext<PlanIntentStoreApi | null>(null);

interface PlanIntentStoreProviderProps {
  children: ReactNode;
}

export function PlanIntentStoreProvider({ children }: PlanIntentStoreProviderProps) {
  const [store] = useState(createPlanIntentStore);

  return (
    <PlanIntentStoreContext.Provider value={store}>
      {children}
    </PlanIntentStoreContext.Provider>
  );
}

export function usePlanIntentStore<T>(selector: (store: PlanIntentState) => T): T {
  const storeContext = useContext(PlanIntentStoreContext);

  if (!storeContext) {
    throw new Error("usePlanIntentStore must be used within PlanIntentStoreProvider");
  }

  return useStore(storeContext, selector);
}
