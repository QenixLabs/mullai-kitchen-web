"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi, type UpdateAddressDto } from "@/api/address.api";
import { addressKeys } from "@/api/query-keys";
import { toast } from "sonner";

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAddressDto }) =>
      addressApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all() });
      toast.success("Address updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message: string }).message
          : "Failed to update address";
      toast.error(message);
    },
  });
}
