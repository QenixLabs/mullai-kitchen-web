import { apiClient } from '@/api/client';
import type {
  MealRosterOverride,
  CreateOverridePayload,
  OverrideListParams,
  OverrideListResponse,
} from '@/api/types/menu.types';

const buildBase = (outletId: string) => `/admin/outlets/${outletId}/overrides`;

export const overrideApi = {
  list: async (outletId: string, params?: OverrideListParams): Promise<OverrideListResponse> => {
    const response = await apiClient.get<OverrideListResponse>(buildBase(outletId), { params });
    return response.data;
  },

  getCalendar: async (outletId: string, dateFrom: string, dateUntil: string): Promise<MealRosterOverride[]> => {
    const response = await apiClient.get<MealRosterOverride[]>(`${buildBase(outletId)}/calendar`, {
      params: { dateFrom, dateUntil },
    });
    return response.data;
  },

  getById: async (outletId: string, id: string): Promise<MealRosterOverride> => {
    const response = await apiClient.get<MealRosterOverride>(`${buildBase(outletId)}/${id}`);
    return response.data;
  },

  create: async (outletId: string, data: CreateOverridePayload): Promise<MealRosterOverride> => {
    const response = await apiClient.post<MealRosterOverride>(buildBase(outletId), data);
    return response.data;
  },

  update: async (outletId: string, id: string, data: Partial<CreateOverridePayload>): Promise<MealRosterOverride> => {
    const response = await apiClient.put<MealRosterOverride>(`${buildBase(outletId)}/${id}`, data);
    return response.data;
  },

  delete: async (outletId: string, id: string): Promise<void> => {
    await apiClient.delete(`${buildBase(outletId)}/${id}`);
  },
};
