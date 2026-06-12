"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  planApi,
  type PlanListParams,
  type CreatePlanPayload,
  type UpdatePlanPayload,
  type PlanStatus,
} from "@/api/plan.api";
import { planKeys } from "@/api/query-keys";

export function usePlans(params?: PlanListParams) {
  return useQuery({
    queryKey: planKeys.list(params),
    queryFn: () => planApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlan(id: string | null) {
  return useQuery({
    queryKey: planKeys.detail(id!),
    queryFn: () => planApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanPayload) => planApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      toast.success("Plan created successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to create plan");
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanPayload }) =>
      planApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
      toast.success("Plan updated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update plan");
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      toast.success("Plan deleted successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete plan");
    },
  });
}

export function useUpdatePlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) =>
      planApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
      toast.success("Plan status updated");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update plan status");
    },
  });
}
