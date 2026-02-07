import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import type { IAuthSession } from "@/api/types/auth.types";
import type { IUser } from "@/api/types/user.types";

export interface UserStoreState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
}

export interface UserStoreActions {
  setSession: (session: IAuthSession) => void;
  setUser: (user: IUser) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
}

export type UserStore = UserStoreState & UserStoreActions;

const defaultUserState: UserStoreState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  hasHydrated: false,
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

export const createUserStore = (initialState: Partial<UserStoreState> = {}) => {
  return createStore<UserStore>()(
    persist(
      (set: (partial: Partial<UserStore>) => void) => ({
        ...defaultUserState,
        ...initialState,
        setSession: (session: IAuthSession) => {
          set({
            user: session.user,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            isAuthenticated: true,
          });
        },
        setUser: (user: IUser) => {
          set({ user });
        },
        clearSession: () => {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        },
        setHasHydrated: (value: boolean) => {
          set({ hasHydrated: value });
        },
      }),
      {
        name: "mk-user-store",
        storage: createJSONStorage(getSessionStorage),
        partialize: (state: UserStore) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state: UserStore | undefined) => {
          state?.setHasHydrated(true);
        },
      },
    ),
  );
};
