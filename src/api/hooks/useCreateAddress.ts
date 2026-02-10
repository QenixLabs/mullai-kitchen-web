"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addressApi } from "@/api/address.api";
import { addressKeys, authKeys } from "@/api/query-keys";
import type { CreateAddressDto } from "@/api/types/customer.types";

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressDto) => addressApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all() });
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
