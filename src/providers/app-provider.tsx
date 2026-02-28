"use client";

import { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { UserStoreProvider, useUserStore } from "@/providers/user-store-provider";
import { PlanIntentStoreProvider } from "@/providers/plan-intent-store-provider";
import { setAuthStateCallback } from "@/api/client";
import type { IAuthSession } from "@/api/types/auth.types";

interface AppProviderProps {
  children: ReactNode;
}

function AuthStateSync() {
  const setSession = useUserStore((store) => store.setSession);
  const clearSession = useUserStore((store) => store.clearSession);

  // Set up callback to update store when auth state changes in the API client
  // This needs to happen only once, so we use a flag on the function
  const callback = setAuthStateCallback as any;

  if (!callback._isSet) {
    callback._isSet = true;
    setAuthStateCallback((session: IAuthSession | null) => {
      if (session) {
        setSession(session);
      } else {
        clearSession();
      }
    });
  }

  return null;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <PlanIntentStoreProvider>
      <UserStoreProvider>
        <AuthStateSync />
        <QueryProvider>{children}</QueryProvider>
      </UserStoreProvider>
    </PlanIntentStoreProvider>
  );
}
