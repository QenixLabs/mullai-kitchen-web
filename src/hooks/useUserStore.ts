import { useUserStore } from "@/providers/user-store-provider";

export const useAuthHydrated = () => useUserStore((store) => store.hasHydrated);

export const useCurrentUser = () => useUserStore((store) => store.user);

export const useIsAuthenticated = () => useUserStore((store) => store.isAuthenticated);

export const useUserActions = () =>
  useUserStore((store) => ({
    setSession: store.setSession,
    setUser: store.setUser,
    clearSession: store.clearSession,
  }));
