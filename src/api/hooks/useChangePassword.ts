"use client";

import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth.api";
import type { IChangePasswordRequest } from "@/api/types/auth.types";

export function useChangePassword() {
  return useMutation<{ message: string }, Error, IChangePasswordRequest>({
    mutationFn: (payload: IChangePasswordRequest) => authApi.changePassword(payload),
  });
}
