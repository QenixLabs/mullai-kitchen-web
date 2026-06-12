"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminSubscriptionApi,
  type AdminSubscriptionListParams,
  type AdminPausePayload,
  type AdminResumePayload,
  type AdminSkipDatesPayload,
} from "@/api/admin-subscription.api";
import { adminSubscriptionKeys } from "@/api/query-keys";

export function useAdminSubscriptions(params?: AdminSubscriptionListParams) {
  return useQuery({
    queryKey: adminSubscriptionKeys.list(params),
    queryFn: () => adminSubscriptionApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminSubscriptionDetail(id: string | null) {
  return useQuery({
    queryKey: adminSubscriptionKeys.detail(id!),
    queryFn: () => adminSubscriptionApi.getDetail(id!),
    enabled: !!id,
  });
}

export function useAdminSubscriptionActivity(id: string | null) {
  return useQuery({
    queryKey: adminSubscriptionKeys.activity(id!),
    queryFn: () => adminSubscriptionApi.getActivityLog(id!),
    enabled: !!id,
  });
}

export function useAdminPauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminPausePayload }) =>
      adminSubscriptionApi.pause(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.detail(variables.id) });
      toast.success("Subscription paused successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to pause subscription");
    },
  });
}

export function useAdminResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminResumePayload }) =>
      adminSubscriptionApi.resume(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.detail(variables.id) });
      toast.success("Subscription resumed successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to resume subscription");
    },
  });
}

export function useAdminSkipDates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminSkipDatesPayload }) =>
      adminSubscriptionApi.skipDates(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSubscriptionKeys.detail(variables.id) });
      toast.success("Dates skipped successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to skip dates");
    },
  });
}
