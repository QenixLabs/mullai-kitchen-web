"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addressApi } from "@/api/address.api";
import { profileApi } from "@/api/profile.api";
import { addressKeys, authKeys, profileKeys } from "@/api/query-keys";
import type { Address, CreateAddressDto, UpdateProfileDto } from "@/api/types/customer.types";
import type { IUser } from "@/api/types/user.types";
import { useCreateAddress } from "@/api/hooks/useCreateAddress";
import { useUpdateProfile } from "@/api/hooks/useUpdateProfile";

export interface SubmitOnboardingPayload {
  addresses: CreateAddressDto[];
  profile?: UpdateProfileDto;
}

export interface SubmitOnboardingResponse {
  addresses: Address[];
  user: IUser | null;
}

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: addressApi.list,
  });
}

export function useOnboarding() {
  const queryClient = useQueryClient();
  const addressesQuery = useAddresses();
  const createAddress = useCreateAddress();
  const updateProfile = useUpdateProfile();

  const submitOnboarding = useMutation({
    mutationFn: async (payload: SubmitOnboardingPayload): Promise<SubmitOnboardingResponse> => {
      const createdAddresses = await Promise.all(
        payload.addresses.map((address) => addressApi.create(address)),
      );

      const profile = payload.profile;
      const hasProfileUpdates = Boolean(
        profile && Object.values(profile).some((value) => value !== undefined),
      );

      const user = hasProfileUpdates && profile ? await profileApi.update(profile) : null;

      return {
        addresses: createdAddresses,
        user,
      };
    },
    onSuccess: (result: SubmitOnboardingResponse) => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all() });
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });

      if (result.user) {
        queryClient.setQueryData(authKeys.me(), result.user);
      }
    },
  });

  return {
    addressesQuery,
    createAddress,
    updateProfile,
    submitOnboarding,
  };
}
