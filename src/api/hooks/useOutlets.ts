"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { outletApi, type OutletListParams, type CreateOutletPayload } from "@/api/outlet.api";
import { outletKeys } from "@/api/query-keys";

export function useOutlets(params?: OutletListParams) {
  return useQuery({
    queryKey: outletKeys.list(params),
    queryFn: () => outletApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useOutlet(id: string | null) {
  return useQuery({
    queryKey: outletKeys.detail(id!),
    queryFn: () => outletApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOutletPayload) => outletApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() });
      toast.success("Outlet created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create outlet");
    },
  });
}

export function useUpdateOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOutletPayload> }) =>
      outletApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() });
      queryClient.invalidateQueries({ queryKey: outletKeys.detail(variables.id) });
      toast.success("Outlet updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update outlet");
    },
  });
}

export function useDeleteOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => outletApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outletKeys.lists() });
      toast.success("Outlet deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete outlet");
    },
  });
}
