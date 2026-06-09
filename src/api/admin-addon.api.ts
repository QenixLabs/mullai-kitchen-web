import { apiClient } from '@/api/client';
import type { AddOnItem } from '@/api/types/addons.types';
import type { PaginatedResponse } from '@/api/admin-inventory.api';

// ─── Query / Payload Types ───────────────────────────────────────────────────

export interface QueryAddOnItemsParams {
  search?: string;
  category?: string;
  meal_type?: string;
  is_available?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateAddOnPayload {
  name: string;
  name_tamil?: string;
  category: string;
  description?: string;
  price: number;
  quantity?: string;
  image?: string;
  is_veg?: boolean;
  is_available?: boolean;
  meal_type?: string[];
  max_quantity_per_order?: number;
  preparation_time?: number;
  outlet_restriction?: string;
}

export interface UpdateAddOnPayload {
  name?: string;
  name_tamil?: string;
  category?: string;
  description?: string;
  price?: number;
  quantity?: string;
  image?: string;
  is_veg?: boolean;
  is_available?: boolean;
  meal_type?: string[];
  max_quantity_per_order?: number;
  preparation_time?: number;
  outlet_restriction?: string;
}

// ─── API Functions ───────────────────────────────────────────────────────────

const BASE = '/menu/add-ons';

export const adminAddOnApi = {
  listAddOns: async (query?: QueryAddOnItemsParams): Promise<PaginatedResponse<AddOnItem>> => {
    const response = await apiClient.get<PaginatedResponse<AddOnItem>>(BASE, { params: query });
    return response.data;
  },

  getAddOn: async (id: string): Promise<AddOnItem> => {
    const response = await apiClient.get<AddOnItem>(`${BASE}/${id}`);
    return response.data;
  },

  createAddOn: async (data: CreateAddOnPayload): Promise<AddOnItem> => {
    const response = await apiClient.post<AddOnItem>(BASE, data);
    return response.data;
  },

  updateAddOn: async (id: string, data: UpdateAddOnPayload): Promise<AddOnItem> => {
    const response = await apiClient.patch<AddOnItem>(`${BASE}/${id}`, data);
    return response.data;
  },

  deleteAddOn: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
