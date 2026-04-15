import { apiClient } from '@/api/client';

// Types
export interface OutletConfigData {
  planning_cutoff_time?: string;
  pause_add_on_cutoff?: string;
  kitchen_lock_time?: string;
  delivery_start_time?: string;
  veg_meal_price?: number;
  nonveg_meal_price?: number;
  delivery_charge?: number;
  tax_rate?: number;
  min_order_value?: number;
  max_daily_capacity?: number;
  max_delivery_radius_km?: number;
  order_generation_window?: number;
  effective_from?: string;
  effective_until?: string;
}

export interface Outlet {
  _id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode: string;
  contact_phone: string;
  contact_email: string;
  status: 'active' | 'inactive';
  location?: { lat: number; lng: number };
  operational_hours: {
    breakfast: { start_time: string; end_time: string };
    lunch: { start_time: string; end_time: string };
    dinner: { start_time: string; end_time: string };
  };
  kitchen_capacity?: number;
  manager?: string;
  established_date?: string;
  delivery_zones: string[];
  config?: OutletConfigData;
  created_at: string;
  updated_at: string;
}

export interface CreateOutletPayload {
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode: string;
  contact_phone: string;
  contact_email: string;
  status?: 'active' | 'inactive';
  location?: { lat: number; lng: number };
  operational_hours: {
    breakfast: { start_time: string; end_time: string };
    lunch: { start_time: string; end_time: string };
    dinner: { start_time: string; end_time: string };
  };
  kitchen_capacity?: number;
  manager?: string;
  established_date?: string;
  config?: OutletConfigData;
}

export interface OutletListParams {
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface OutletListResponse {
  data: Outlet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BASE = '/admin/outlets';

export const outletApi = {
  list: async (params?: OutletListParams): Promise<OutletListResponse> => {
    const response = await apiClient.get<OutletListResponse>(BASE, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Outlet> => {
    const response = await apiClient.get<Outlet>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: CreateOutletPayload): Promise<Outlet> => {
    const response = await apiClient.post<Outlet>(BASE, data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateOutletPayload>,
  ): Promise<Outlet> => {
    const response = await apiClient.put<Outlet>(`${BASE}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
