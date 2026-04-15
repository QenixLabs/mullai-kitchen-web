import { apiClient } from '@/api/client';
import type {
  AdminSubscription,
  AdminSubscriptionListParams,
  AdminSubscriptionListResponse,
  AdminPausePayload,
  AdminResumePayload,
  AdminSkipDatesPayload,
  SubscriptionActivityResponse,
} from '@/api/types/admin-subscription.types';

export type {
  AdminSubscriptionListParams,
  AdminPausePayload,
  AdminResumePayload,
  AdminSkipDatesPayload,
};

const BASE = '/admin/subscriptions';

export const adminSubscriptionApi = {
  list: async (params?: AdminSubscriptionListParams): Promise<AdminSubscriptionListResponse> => {
    const response = await apiClient.get<AdminSubscriptionListResponse>(BASE, { params });
    return response.data;
  },

  getDetail: async (id: string): Promise<AdminSubscription> => {
    const response = await apiClient.get<AdminSubscription>(`${BASE}/${id}`);
    return response.data;
  },

  pause: async (id: string, data: AdminPausePayload): Promise<AdminSubscription> => {
    const response = await apiClient.put<AdminSubscription>(`${BASE}/${id}/pause`, data);
    return response.data;
  },

  resume: async (id: string, data: AdminResumePayload): Promise<AdminSubscription> => {
    const response = await apiClient.put<AdminSubscription>(`${BASE}/${id}/resume`, data);
    return response.data;
  },

  skipDates: async (id: string, data: AdminSkipDatesPayload): Promise<AdminSubscription> => {
    const response = await apiClient.put<AdminSubscription>(`${BASE}/${id}/skip-dates`, data);
    return response.data;
  },

  getActivityLog: async (id: string): Promise<SubscriptionActivityResponse> => {
    const response = await apiClient.get<SubscriptionActivityResponse>(`${BASE}/${id}/activity`);
    return response.data;
  },
};
