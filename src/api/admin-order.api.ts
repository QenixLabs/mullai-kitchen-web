import { apiClient } from '@/api/client';
import type {
  UnifiedOrder,
  AdminOrderListParams,
  AdminOrderListResponse,
  UpdateOrderStatusPayload,
  BatchUpdateStatusPayload,
} from '@/api/types/admin-order.types';

export type {
  AdminOrderListParams,
  UpdateOrderStatusPayload,
  BatchUpdateStatusPayload,
};

const BASE = '/admin/orders';

export const adminOrderApi = {
  list: async (params?: AdminOrderListParams): Promise<AdminOrderListResponse> => {
    const response = await apiClient.get<AdminOrderListResponse>(BASE, { params });
    return response.data;
  },

  getDetail: async (id: string): Promise<UnifiedOrder> => {
    const response = await apiClient.get<UnifiedOrder>(`${BASE}/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateOrderStatusPayload): Promise<UnifiedOrder> => {
    const response = await apiClient.put<UnifiedOrder>(`${BASE}/${id}/status`, data);
    return response.data;
  },

  batchUpdateStatus: async (routeId: string, data: BatchUpdateStatusPayload): Promise<void> => {
    const response = await apiClient.put(`${BASE}/routes/${routeId}/batch-status`, data);
    return response.data;
  },
};
