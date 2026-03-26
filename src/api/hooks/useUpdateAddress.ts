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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update address");
    },
  });
}
