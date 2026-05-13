import { apiClient } from '@/api/client';
import { ADMIN_COUPON_ROUTES } from '@/api/routes';
import type {
  AdminCoupon,
  CreateCouponPayload,
  UpdateCouponPayload,
  UpdateCouponStatusPayload,
  CouponListParams,
  CouponListResponse,
  CouponStatsResponse,
} from '@/api/types/admin-coupon.types';

export type {
  CreateCouponPayload,
  UpdateCouponPayload,
  UpdateCouponStatusPayload,
  CouponListParams,
} from '@/api/types/admin-coupon.types';

export const adminCouponApi = {
  list: async (params?: CouponListParams): Promise<CouponListResponse> => {
    const response = await apiClient.get<CouponListResponse>(ADMIN_COUPON_ROUTES.BASE, { params });
    return response.data;
  },

  getById: async (id: string): Promise<AdminCoupon> => {
    const response = await apiClient.get<AdminCoupon>(ADMIN_COUPON_ROUTES.DETAIL(id));
    return response.data;
  },

  create: async (data: CreateCouponPayload): Promise<AdminCoupon> => {
    const response = await apiClient.post<AdminCoupon>(ADMIN_COUPON_ROUTES.BASE, data);
    return response.data;
  },

  update: async (id: string, data: UpdateCouponPayload): Promise<AdminCoupon> => {
    const response = await apiClient.put<AdminCoupon>(ADMIN_COUPON_ROUTES.DETAIL(id), data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateCouponStatusPayload): Promise<AdminCoupon> => {
    const response = await apiClient.put<AdminCoupon>(ADMIN_COUPON_ROUTES.STATUS(id), data);
    return response.data;
  },

  getStats: async (id: string): Promise<CouponStatsResponse> => {
    const response = await apiClient.get<CouponStatsResponse>(ADMIN_COUPON_ROUTES.STATS(id));
    return response.data;
  },
};
