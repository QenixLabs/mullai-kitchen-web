// ===========================================
// Coupon Types
// ===========================================

export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT";
export type CouponApplicability = "SUBSCRIPTION" | "ADDON" | "BOTH";
export type CouponDistributionType = "PUBLIC" | "USER_SPECIFIC" | "REFERRAL";
export type CouponStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

// ===========================================
// Coupon Response Types
// ===========================================

export interface Coupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  max_discount?: number;
  applicable_to: CouponApplicability;
  min_order_value?: number;
  distribution_type: CouponDistributionType;
  usage_limit: number;
  usage_count: number;
  valid_from: string;
  valid_until: string;
  status: CouponStatus;
  description?: string;
}

export interface AvailableCoupon {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  max_discount?: number;
  applicable_to: CouponApplicability;
  description?: string;
}

// ===========================================
// Coupon Validation Types
// ===========================================

export interface ValidateCouponRequest {
  code: string;
  order_type: "SUBSCRIPTION" | "ADDON";
  order_amount: number;
  plan_id?: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  discount_amount: number;
  final_amount: number;
  message?: string;
  coupon_id?: string;
}

// ===========================================
// List Available Coupons Types
// ===========================================

export interface ListCouponsParams {
  order_type: "SUBSCRIPTION" | "ADDON";
  order_amount: number;
}

export interface ListCouponsResponse {
  success: boolean;
  data: AvailableCoupon[];
}
