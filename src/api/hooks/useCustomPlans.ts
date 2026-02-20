"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { customPlanApi } from "@/api/custom-plan.api";
import { customerKeys } from "@/api/query-keys";
import type {
  CreateCustomPlanDto,
  QueryCustomPlans,
  UpdateCustomPlanDto,
} from "@/api/types/customer.types";

export function useCustomPlans(params?: QueryCustomPlans) {
  return useQuery({
    queryKey: customerKeys.customPlans(params),
    queryFn: () => customPlanApi.list(params),
  });
}

export function useCustomPlan(planId: string | undefined) {
  return useQuery({
    queryKey: planId ? customerKeys.customPlan(planId) : customerKeys.customPlan(""),
    queryFn: () => customPlanApi.getById(planId ?? ""),
    enabled: Boolean(planId),
  });
}

export function useCreateCustomPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomPlanDto) => customPlanApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.customPlans() });
    },
  });
}

export function useUpdateCustomPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: UpdateCustomPlanDto }) =>
      customPlanApi.update(planId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.customPlan(variables.planId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.customPlans() });
    },
  });
}

export function useDeleteCustomPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => customPlanApi.delete(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.customPlans() });
    },
  });
}
