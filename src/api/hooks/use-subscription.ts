import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/api/subscription.api";
import { subscriptionKeys } from "@/api/query-keys";
import type {
  SubscriptionListResponse,
  SubscriptionResponse,
  SubscriptionDetailResponse,
  DailyOrdersResponse,
  PausePeriodsResponse,
  PauseSubscriptionRequest,
  ResumeSubscriptionRequest,
  CancelSubscriptionRequest,
  RenewSubscriptionRequest,
  ToggleAutoRenewRequest,
} from "@/api/types/subscription.types";

// Queries
export function useSubscriptions(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<SubscriptionListResponse>({
    queryKey: subscriptionKeys.subscriptions(params),
    queryFn: () => subscriptionApi.getSubscriptions(params as any),
    staleTime: 60_000, // 1 minute
  });
}

export function useSubscription(id: string) {
  return useQuery<SubscriptionDetailResponse>({
    queryKey: subscriptionKeys.subscription(id),
    queryFn: () => subscriptionApi.getSubscription(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useDailyOrders(id: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery<DailyOrdersResponse>({
    queryKey: subscriptionKeys.dailyOrders(id, params),
    queryFn: () => subscriptionApi.getDailyOrders(id, params as any),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function usePausePeriods(id: string) {
  return useQuery<PausePeriodsResponse>({
    queryKey: subscriptionKeys.pausePeriods(id),
    queryFn: () => subscriptionApi.getPausePeriods(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

// Mutations
export function usePauseSubscription() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { id: string } & PauseSubscriptionRequest>({
    mutationFn: ({ id, ...data }) => subscriptionApi.pauseSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all() });
    },
    onError: (error) => {
      console.error("Pause subscription failed:", error);
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { id: string } & ResumeSubscriptionRequest>({
    mutationFn: ({ id, ...data }) => subscriptionApi.resumeSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all() });
    },
    onError: (error) => {
      console.error("Resume subscription failed:", error);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { id: string } & CancelSubscriptionRequest>({
    mutationFn: ({ id, ...data }) => subscriptionApi.cancelSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all() });
    },
    onError: (error) => {
      console.error("Cancel subscription failed:", error);
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string; subscription_id?: string }, Error, { id: string } & RenewSubscriptionRequest>({
    mutationFn: ({ id, ...data }) => subscriptionApi.renewSubscription(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all() });
      if (data.subscription_id) {
        queryClient.invalidateQueries({ queryKey: subscriptionKeys.subscription(data.subscription_id) });
      }
    },
    onError: (error) => {
      console.error("Renew subscription failed:", error);
    },
  });
}

export function useToggleAutoRenew() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { id: string } & ToggleAutoRenewRequest>({
    mutationFn: ({ id, ...data }) => subscriptionApi.toggleAutoRenew(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all() });
    },
    onError: (error) => {
      console.error("Toggle auto-renew failed:", error);
    },
  });
}
