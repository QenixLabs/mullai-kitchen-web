"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { authApi } from "@/api/auth.api";
import { authKeys } from "@/api/query-keys";
import { userApi } from "@/api/user.api";
import type {
  IAuthSession,
  ICorporateRegisterRequest,
  IForgotPasswordRequest,
  ILoginRequest,
  IRefreshTokenRequest,
  IRegisterRequest,
  IResetPasswordRequest,
  IVerifyResetOtpRequest,
} from "@/api/types/auth.types";
import type { IUser } from "@/api/types/user.types";
import { useUserStore } from "@/providers/user-store-provider";
import { clearTokenPair, getRefreshToken, setTokenPair } from "@/lib/storage";
import { toast } from "sonner";

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

export function useCorporateRegister() {
  return useMutation({
    mutationFn: (payload: ICorporateRegisterRequest) =>
      authApi.corporateRegister(payload),
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
      queryClient.clear();
      if (typeof window !== "undefined") {
        localStorage.removeItem("mk-user-store");
      }
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: IForgotPasswordRequest) => authApi.forgotPassword(payload),
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: (payload: IVerifyResetOtpRequest) => authApi.verifyResetOtp(payload),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: IResetPasswordRequest) => authApi.resetPassword(payload),
  });
}

export function useSendSignupOtp() {
  return useMutation({
    mutationFn: authApi.sendSignupOtp,
  });
}

export function useVerifySignupOtp() {
  return useMutation({
    mutationFn: authApi.verifySignupOtp,
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const clearSession = useUserStore((store) => store.clearSession);

  return useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: () => {
      clearTokenPair();
      clearSession();
      queryClient.clear();
      if (typeof window !== "undefined") {
        localStorage.removeItem("mk-user-store");
      }
      toast.success("Account deleted successfully");
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : "Failed to delete account";
      toast.error(message);
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
