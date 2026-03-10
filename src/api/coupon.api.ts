import { apiClient } from "@/api/client";
import { COUPON_ROUTES } from "@/api/routes";
import type {
  ValidateCouponRequest,
  CouponValidationResponse,
  ListCouponsParams,
  ListCouponsResponse,
} from "@/api/types/coupon.types";

export const couponApi = {
  /**
   * Validates a coupon code for the given order
   */
  validateCoupon: async (
    payload: ValidateCouponRequest,
  ): Promise<CouponValidationResponse> => {
    const response = await apiClient.post<CouponValidationResponse>(
      COUPON_ROUTES.VALIDATE,
      payload,
    );
    return response.data;
  },

  /**
   * Gets available coupons for the user based on order type and amount
   */
  listAvailableCoupons: async (
    params: ListCouponsParams,
  ): Promise<ListCouponsResponse> => {
    const response = await apiClient.get<ListCouponsResponse>(
      COUPON_ROUTES.LIST,
      { params },
    );
    return response.data;
  },
};
