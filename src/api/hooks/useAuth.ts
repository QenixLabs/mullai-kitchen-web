"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { authApi } from "@/api/auth.api";
import { authKeys } from "@/api/query-keys";
import { userApi } from "@/api/user.api";
import type {
  IAuthSession,
  ILoginRequest,
  IRefreshTokenRequest,
  IRegisterRequest,
} from "@/api/types/auth.types";
import type { IUser } from "@/api/types/user.types";
import { useUserStore } from "@/providers/user-store-provider";
import { clearTokenPair, getRefreshToken, setTokenPair } from "@/lib/storage";

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useUserStore((store) => store.setSession);

  return useMutation({
    mutationFn: (payload: ILoginRequest) => authApi.login(payload),
    onSuccess: (session: IAuthSession) => {
      setTokenPair(session.access_token, session.refresh_token);
      setSession(session);
      queryClient.setQueryData(authKeys.me(), session.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setSession = useUserStore((store) => store.setSession);

  return useMutation({
    mutationFn: (payload: IRegisterRequest) => authApi.register(payload),
    onSuccess: (session: IAuthSession) => {
      setTokenPair(session.access_token, session.refresh_token);
      setSession(session);
      queryClient.setQueryData(authKeys.me(), session.user);
    },
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();
  const setSession = useUserStore((store) => store.setSession);

  return useMutation({
    mutationFn: (payload?: IRefreshTokenRequest) => {
      const refreshToken = payload?.refresh_token ?? getRefreshToken();

      if (!refreshToken) {
        throw new Error("Refresh token missing");
      }

      return authApi.refreshToken({ refresh_token: refreshToken });
    },
    onSuccess: (session: IAuthSession) => {
      setTokenPair(session.access_token, session.refresh_token);
      setSession(session);
      queryClient.setQueryData(authKeys.me(), session.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useUserStore((store) => store.clearSession);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearTokenPair();
      clearSession();
      queryClient.removeQueries({ queryKey: authKeys.all() });
    },
  });
}

export function useMyProfile() {
  const hasHydrated = useUserStore((store) => store.hasHydrated);
  const isAuthenticated = useUserStore((store) => store.isAuthenticated);
  const setUser = useUserStore((store) => store.setUser);

  const query = useQuery<IUser>({
    queryKey: authKeys.me(),
    queryFn: userApi.me,
    enabled: hasHydrated && isAuthenticated,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}
