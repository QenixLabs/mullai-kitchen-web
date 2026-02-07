"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { useStore } from "zustand";

import { createUserStore, UserStore } from "@/stores/user-store";

type UserStoreApi = ReturnType<typeof createUserStore>;

const UserStoreContext = createContext<UserStoreApi | null>(null);

interface UserStoreProviderProps {
  children: ReactNode;
}

export function UserStoreProvider({ children }: UserStoreProviderProps) {
  const [store] = useState(createUserStore);

  return <UserStoreContext.Provider value={store}>{children}</UserStoreContext.Provider>;
}

export function useUserStore<T>(selector: (store: UserStore) => T): T {
  const userStoreContext = useContext(UserStoreContext);

  if (!userStoreContext) {
    throw new Error("useUserStore must be used within UserStoreProvider");
  }

  return useStore(userStoreContext, selector);
}
