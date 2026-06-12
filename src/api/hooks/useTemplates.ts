"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { templateApi } from "@/api/template.api";
import { templateKeys } from "@/api/query-keys";
import type { TemplateListParams, CreateTemplatePayload, BulkCopyPayload } from "@/api/types/menu.types";

export function useTemplates(outletId: string, params?: TemplateListParams) {
  return useQuery({
    queryKey: templateKeys.list(outletId, params),
    queryFn: () => templateApi.list(outletId, params),
    enabled: !!outletId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useWeeklyGrid(outletId: string, effectiveFrom?: string) {
  return useQuery({
    queryKey: templateKeys.grid(outletId, effectiveFrom),
    queryFn: () => templateApi.getGrid(outletId, effectiveFrom),
    enabled: !!outletId,
  });
}

export function useTemplate(outletId: string, id: string | null) {
  return useQuery({
    queryKey: templateKeys.detail(outletId, id!),
    queryFn: () => templateApi.getById(outletId, id!),
    enabled: !!outletId && !!id,
  });
}

export function useCreateTemplate(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplatePayload) => templateApi.create(outletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists(outletId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.grid(outletId) });
      toast.success("Template created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create template");
    },
  });
}

export function useUpdateTemplate(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplatePayload> }) =>
      templateApi.update(outletId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists(outletId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.grid(outletId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(outletId, variables.id) });
      toast.success("Template updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update template");
    },
  });
}

export function useDeleteTemplate(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateApi.delete(outletId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists(outletId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.grid(outletId) });
      toast.success("Template deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete template");
    },
  });
}

export function useTogglePublish(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => templateApi.togglePublish(outletId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists(outletId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.grid(outletId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(outletId, id) });
      toast.success("Publish status toggled");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to toggle publish");
    },
  });
}

export function useBulkCopy(outletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkCopyPayload) => templateApi.bulkCopy(outletId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all(variables.source_outlet_id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.all(variables.target_outlet_id) });
      toast.success("Templates copied successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to copy templates");
    },
  });
}
