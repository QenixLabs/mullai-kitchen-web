import { apiClient } from '@/api/client';
import type {
  Plan,
  CreatePlanPayload,
  UpdatePlanPayload,
  PlanListParams,
  PlanListResponse,
  PlanStatus,
} from '@/api/types/admin-subscription.types';

export type { PlanListParams, CreatePlanPayload, UpdatePlanPayload, PlanStatus };

const BASE = '/admin/plans';

export const planApi = {
  list: async (params?: PlanListParams): Promise<PlanListResponse> => {
    const response = await apiClient.get<PlanListResponse>(BASE, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Plan> => {
    const response = await apiClient.get<Plan>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: CreatePlanPayload): Promise<Plan> => {
    const response = await apiClient.post<Plan>(BASE, data);
    return response.data;
  },

  update: async (id: string, data: UpdatePlanPayload): Promise<Plan> => {
    const response = await apiClient.put<Plan>(`${BASE}/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: PlanStatus): Promise<Plan> => {
    const response = await apiClient.patch<Plan>(`${BASE}/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
