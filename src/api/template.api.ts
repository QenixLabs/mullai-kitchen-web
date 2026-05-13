import { apiClient } from '@/api/client';
import type {
  WeeklyMealTemplate,
  CreateTemplatePayload,
  TemplateListParams,
  TemplateListResponse,
  BulkCopyPayload,
} from '@/api/types/menu.types';

const buildBase = (outletId: string) => `/admin/outlets/${outletId}/templates`;

export const templateApi = {
  list: async (outletId: string, params?: TemplateListParams): Promise<TemplateListResponse> => {
    const response = await apiClient.get<TemplateListResponse>(buildBase(outletId), { params });
    return response.data;
  },

  getGrid: async (outletId: string, effectiveFrom?: string): Promise<WeeklyMealTemplate[]> => {
    const params = effectiveFrom ? { effectiveFrom } : undefined;
    const response = await apiClient.get<WeeklyMealTemplate[]>(`${buildBase(outletId)}/grid`, { params });
    return response.data;
  },

  getById: async (outletId: string, id: string): Promise<WeeklyMealTemplate> => {
    const response = await apiClient.get<WeeklyMealTemplate>(`${buildBase(outletId)}/${id}`);
    return response.data;
  },

  create: async (outletId: string, data: CreateTemplatePayload): Promise<WeeklyMealTemplate> => {
    const response = await apiClient.post<WeeklyMealTemplate>(buildBase(outletId), data);
    return response.data;
  },

  update: async (outletId: string, id: string, data: Partial<CreateTemplatePayload>): Promise<WeeklyMealTemplate> => {
    const response = await apiClient.put<WeeklyMealTemplate>(`${buildBase(outletId)}/${id}`, data);
    return response.data;
  },

  togglePublish: async (outletId: string, id: string): Promise<WeeklyMealTemplate> => {
    const response = await apiClient.patch<WeeklyMealTemplate>(`${buildBase(outletId)}/${id}/toggle-publish`);
    return response.data;
  },

  delete: async (outletId: string, id: string): Promise<void> => {
    await apiClient.delete(`${buildBase(outletId)}/${id}`);
  },

  bulkCopy: async (outletId: string, data: BulkCopyPayload): Promise<{ message: string; count: number }> => {
    const response = await apiClient.post<{ message: string; count: number }>(`${buildBase(outletId)}/bulk-copy`, data);
    return response.data;
  },
};
