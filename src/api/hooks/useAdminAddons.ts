"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminAddOnApi } from "@/api/admin-addon.api";
import { adminAddOnKeys } from "@/api/query-keys";
import type {
  CreateAddOnPayload,
  UpdateAddOnPayload,
  QueryAddOnItemsParams,
} from "@/api/admin-addon.api";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useAddOns(params?: QueryAddOnItemsParams) {
  return useQuery({
    queryKey: adminAddOnKeys.list(params),
    queryFn: () => adminAddOnApi.listAddOns(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddOn(id: string | null) {
  return useQuery({
    queryKey: adminAddOnKeys.detail(id!),
    queryFn: () => adminAddOnApi.getAddOn(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddOnPayload) => adminAddOnApi.createAddOn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAddOnKeys.lists() });
      toast.success("Add-on created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create add-on");
    },
  });
}

export function useUpdateAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddOnPayload }) =>
      adminAddOnApi.updateAddOn(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminAddOnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminAddOnKeys.detail(variables.id) });
      toast.success("Add-on updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update add-on");
    },
  });
}

export function useDeleteAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAddOnApi.deleteAddOn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminAddOnKeys.lists() });
      toast.success("Add-on deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete add-on");
    },
  });
}
