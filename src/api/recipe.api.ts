import { apiClient } from '@/api/client';
import type {
  Recipe,
  CreateRecipePayload,
  RecipeListParams,
  RecipeListResponse,
  RecipeSelectItem,
  RecipeStatus,
} from '@/api/types/menu.types';

const BASE = '/admin/recipes';

export const recipeApi = {
  list: async (params?: RecipeListParams): Promise<RecipeListResponse> => {
    const response = await apiClient.get<RecipeListResponse>(BASE, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Recipe> => {
    const response = await apiClient.get<Recipe>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: CreateRecipePayload): Promise<Recipe> => {
    const response = await apiClient.post<Recipe>(BASE, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateRecipePayload>): Promise<Recipe> => {
    const response = await apiClient.put<Recipe>(`${BASE}/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: RecipeStatus): Promise<Recipe> => {
    const response = await apiClient.patch<Recipe>(`${BASE}/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  getForSelect: async (outletId?: string): Promise<RecipeSelectItem[]> => {
    const params = outletId ? { outletId } : undefined;
    const response = await apiClient.get<RecipeSelectItem[]>(`${BASE}/select`, { params });
    return response.data;
  },
};
