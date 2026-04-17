import { apiClient } from '@/api/client';

export interface DeliveryRoute {
  _id: string;
  name: string;
  outlet_id: string;
  outlet_name?: string;
  assigned_partner?: {
    id: string;
    name: string;
    phone: string;
    vehicle_number: string;
    status: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  order_count: number;
  stops?: number;
  completed_stops: number;
  estimated_start_time?: string;
  order_generation_date: string;
  published_at?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RouteListResponse {
  data: DeliveryRoute[];
}

export interface GenerateRoutesPayload {
  date: string;
}

export interface AssignPartnerPayload {
  partner_id: string;
}

export const adminRouteApi = {
  list: async (outletId: string, date?: string): Promise<RouteListResponse> => {
    const response = await apiClient.get<RouteListResponse>(`/admin/outlets/${outletId}/routes`, { params: { date } });
    return response.data;
  },

  generate: async (outletId: string, data: GenerateRoutesPayload): Promise<DeliveryRoute[]> => {
    const response = await apiClient.post<DeliveryRoute[]>(`/admin/outlets/${outletId}/routes/generate`, data);
    return response.data;
  },

  assignPartner: async (outletId: string, routeId: string, data: AssignPartnerPayload): Promise<DeliveryRoute> => {
    const response = await apiClient.put<DeliveryRoute>(`/admin/outlets/${outletId}/routes/${routeId}/assign`, data);
    return response.data;
  },

  startRoute: async (outletId: string, routeId: string): Promise<DeliveryRoute> => {
    const response = await apiClient.put<DeliveryRoute>(`/admin/outlets/${outletId}/routes/${routeId}/start`);
    return response.data;
  },

  completeRoute: async (outletId: string, routeId: string): Promise<DeliveryRoute> => {
    const response = await apiClient.put<DeliveryRoute>(`/admin/outlets/${outletId}/routes/${routeId}/complete`);
    return response.data;
  },

  deleteRoute: async (outletId: string, routeId: string): Promise<void> => {
    await apiClient.delete(`/admin/outlets/${outletId}/routes/${routeId}`);
  },
};
