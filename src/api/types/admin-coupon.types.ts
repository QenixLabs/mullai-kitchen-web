import type { CouponType, CouponApplicability, CouponDistributionType, CouponStatus } from './coupon.types';

export interface AdminCoupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  max_discount?: number;
  applicable_to: CouponApplicability;
  min_order_value?: number;
  distribution_type: CouponDistributionType;
  assigned_user_ids?: string[];
  usage_limit: number;
  usage_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  status: CouponStatus;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponPayload {
  code: string;
  type: CouponType;
  value: number;
  max_discount?: number;
  applicable_to: CouponApplicability;
  min_order_value?: number;
  distribution_type: CouponDistributionType;
  assigned_user_ids?: string[];
  usage_limit: number;
  per_user_limit?: number;
  valid_from: string;
  valid_until: string;
  description?: string;
}

export interface UpdateCouponPayload {
  code?: string;
  type?: CouponType;
  value?: number;
  max_discount?: number;
  applicable_to?: CouponApplicability;
  min_order_value?: number;
  distribution_type?: CouponDistributionType;
  assigned_user_ids?: string[];
  usage_limit?: number;
  per_user_limit?: number;
  valid_from?: string;
  valid_until?: string;
  description?: string;
}

export interface UpdateCouponStatusPayload {
  status: CouponStatus;
}

export interface CouponListParams {
  page?: number;
  limit?: number;
  status?: CouponStatus;
  search?: string;
}

export interface CouponListResponse {
  coupons: AdminCoupon[];
  total: number;
}

export interface CouponStatsResponse {
  coupon: AdminCoupon;
  usage_rate: number;
  total_discount_given: number;
}
