"use client";

import { ReactNode } from "react";

import { QueryProvider } from "@/providers/query-provider";
import { UserStoreProvider } from "@/providers/user-store-provider";

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <UserStoreProvider>
      <QueryProvider>{children}</QueryProvider>
    </UserStoreProvider>
  );
}
