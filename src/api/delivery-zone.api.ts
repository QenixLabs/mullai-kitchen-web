import { apiClient } from './client';

export interface DeliveryZone {
  _id: string;
  outlet_id: string;
  outlet_name: string;
  name: string;
  description?: string;
  zone_type: 'POLYGON' | 'CIRCLE';
  boundary?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  center?: {
    lat: number;
    lng: number;
  };
  radius_km?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateZonePayload {
  outlet_id: string;
  name: string;
  description?: string;
  zone_type: 'POLYGON' | 'CIRCLE';
  boundary?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  center?: {
    lat: number;
    lng: number;
  };
  radius_km?: number;
  is_active?: boolean;
}

export const deliveryZoneApi = {
  create: async (payload: CreateZonePayload): Promise<DeliveryZone> => {
    const response = await apiClient.post('/delivery-zones', payload);
    return response.data;
  },

  list: async (outletId?: string): Promise<DeliveryZone[]> => {
    const params = outletId ? { outletId } : {};
    const response = await apiClient.get('/delivery-zones', { params });
    return response.data;
  },

  getById: async (id: string): Promise<DeliveryZone> => {
    const response = await apiClient.get(`/delivery-zones/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    payload: Partial<CreateZonePayload>,
  ): Promise<DeliveryZone> => {
    const response = await apiClient.put(`/delivery-zones/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/delivery-zones/${id}`);
  },

  checkServiceability: async (
    lat: number,
    lng: number,
  ): Promise<{ isServiceable: boolean; outlet: DeliveryZone | null }> => {
    const response = await apiClient.get('/delivery-zones/check/serviceability', {
      params: { lat, lng },
    });
    return response.data;
  },
};
