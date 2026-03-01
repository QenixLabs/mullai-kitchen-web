"use client";

import { ReactNode, useEffect, useRef } from "react";

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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setAuthStateCallback((session: IAuthSession | null) => {
      if (session) {
        setSession(session);
      } else {
        clearSession();
      }
    });
  }, [setSession, clearSession]);

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
