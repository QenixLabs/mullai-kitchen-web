"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profileApi } from "@/api/profile.api";
import { authKeys, profileKeys } from "@/api/query-keys";
import type { UpdateProfileDto } from "@/api/types/customer.types";
import type { IUser } from "@/api/types/user.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileDto) => profileApi.update(payload),
    onSuccess: (user: IUser) => {
      queryClient.setQueryData(authKeys.me(), user);
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
