"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { overrideApi } from "@/api/override.api";
import { overrideKeys } from "@/api/query-keys";
import type { OverrideListParams, CreateOverridePayload } from "@/api/types/menu.types";

export function useOverrides(outletId: string, params?: OverrideListParams) {
  return useQuery({
    queryKey: overrideKeys.list(outletId, params),
    queryFn: () => overrideApi.list(outletId, params),
    enabled: !!outletId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOverrideCalendar(outletId: string, dateFrom: string, dateUntil: string) {
  return useQuery({
    queryKey: overrideKeys.calendar(outletId, dateFrom, dateUntil),
    queryFn: () => overrideApi.getCalendar(outletId, dateFrom, dateUntil),
    enabled: !!outletId && !!dateFrom && !!dateUntil,
  });
}

export function useOverride(outletId: string, id: string | null) {
  return useQuery({
    queryKey: overrideKeys.detail(outletId, id!),
    queryFn: () => overrideApi.getById(outletId, id!),
    enabled: !!outletId && !!id,
  });
}

export function useCreateOverride(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOverridePayload) => overrideApi.create(outletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overrideKeys.all(outletId) });
      toast.success("Override created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create override");
    },
  });
}

export function useUpdateOverride(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateOverridePayload> }) =>
      overrideApi.update(outletId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: overrideKeys.all(outletId) });
      toast.success("Override updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update override");
    },
  });
}

export function useDeleteOverride(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => overrideApi.delete(outletId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overrideKeys.all(outletId) });
      toast.success("Override deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete override");
    },
  });
}
