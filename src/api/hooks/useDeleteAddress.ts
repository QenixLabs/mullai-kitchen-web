"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "@/api/address.api";
import { addressKeys } from "@/api/query-keys";
import { toast } from "sonner";

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all() });
      toast.success("Address deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete address");
    },
  });
}
