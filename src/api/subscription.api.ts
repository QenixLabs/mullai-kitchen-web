import { apiClient } from "@/api/client";
import { SUBSCRIPTION_ROUTES } from "@/api/routes";
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
  QuerySubscriptionsParams,
  QueryDailyOrdersParams,
  QueryPausePeriodsParams,
  OptOutPeriodsResponse,
  CreateOptOutRequest,
  CreateOptOutResponse,
  QueryOptOutPeriodsParams,
} from "@/api/types/subscription.types";

export const subscriptionApi = {
  /**
   * Gets all subscriptions for authenticated user
   */
  getSubscriptions: async (params?: QuerySubscriptionsParams): Promise<SubscriptionListResponse> => {
    const response = await apiClient.get<SubscriptionListResponse>(
      SUBSCRIPTION_ROUTES.SUBSCRIPTIONS,
      { params },
    );
    return response.data;
  },

  /**
   * Gets single subscription details
   */
  getSubscription: async (id: string): Promise<SubscriptionDetailResponse> => {
    const response = await apiClient.get<SubscriptionDetailResponse>(
      SUBSCRIPTION_ROUTES.SUBSCRIPTION(id),
    );
    return response.data;
  },

  /**
   * Gets delivery history for subscription
   */
  getDailyOrders: async (id: string, params?: QueryDailyOrdersParams): Promise<DailyOrdersResponse> => {
    const response = await apiClient.get<DailyOrdersResponse>(
      SUBSCRIPTION_ROUTES.DAILY_ORDERS(id),
      { params },
    );
    return response.data;
  },

  /**
   * Gets pause history for subscription
   */
  getPausePeriods: async (id: string, params?: QueryPausePeriodsParams): Promise<PausePeriodsResponse> => {
    const response = await apiClient.get<PausePeriodsResponse>(
      SUBSCRIPTION_ROUTES.PAUSE_PERIODS(id),
      { params },
    );
    return response.data;
  },

  /**
   * Pauses subscription
   */
  pauseSubscription: async (
    id: string,
    payload: PauseSubscriptionRequest,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      SUBSCRIPTION_ROUTES.PAUSE(id),
      payload,
    );
    return response.data;
  },

  /**
   * Resumes subscription
   */
  resumeSubscription: async (
    id: string,
    payload: ResumeSubscriptionRequest,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      SUBSCRIPTION_ROUTES.RESUME(id),
      payload,
    );
    return response.data;
  },

  /**
   * Cancels subscription
   */
  cancelSubscription: async (
    id: string,
    payload: CancelSubscriptionRequest,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      SUBSCRIPTION_ROUTES.CANCEL(id),
      payload,
    );
    return response.data;
  },

  /**
   * Renews subscription
   */
  renewSubscription: async (
    id: string,
    payload: RenewSubscriptionRequest,
  ): Promise<{ success: boolean; message: string; subscription_id?: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string; subscription_id?: string }>(
      SUBSCRIPTION_ROUTES.RENEW(id),
      payload,
    );
    return response.data;
  },

  /**
   * Toggles auto-renew setting
   */
  toggleAutoRenew: async (
    id: string,
    payload: ToggleAutoRenewRequest,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      SUBSCRIPTION_ROUTES.TOGGLE_AUTO_RENEW(id),
      payload,
    );
    return response.data;
  },

  /**
   * Gets opt-out periods for subscription
   */
  getOptOutPeriods: async (id: string, params?: QueryOptOutPeriodsParams): Promise<OptOutPeriodsResponse> => {
    const response = await apiClient.get<OptOutPeriodsResponse>(
      SUBSCRIPTION_ROUTES.OPT_OUT_PERIODS(id),
      { params },
    );
    return response.data;
  },

  /**
   * Creates an opt-out period for subscription
   */
  createOptOutPeriod: async (
    id: string,
    payload: CreateOptOutRequest,
  ): Promise<CreateOptOutResponse> => {
    const response = await apiClient.post<CreateOptOutResponse>(
      SUBSCRIPTION_ROUTES.OPT_OUT(id),
      payload,
    );
    return response.data;
  },

  /**
   * Cancels an opt-out period
   */
  cancelOptOutPeriod: async (
    id: string,
    optOutId: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      SUBSCRIPTION_ROUTES.CANCEL_OPT_OUT(id, optOutId),
    );
    return response.data;
  },
};
