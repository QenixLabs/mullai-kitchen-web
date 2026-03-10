import { useMutation, useQuery } from "@tanstack/react-query";
import { couponApi } from "@/api/coupon.api";
import { couponKeys } from "@/api/query-keys";
import type {
  ValidateCouponRequest,
  CouponValidationResponse,
  ListCouponsParams,
  ListCouponsResponse,
} from "@/api/types/coupon.types";

/**
 * Hook to validate a coupon code
 * Returns a mutation function to validate coupons on demand
 */
export function useValidateCoupon() {
  return useMutation<CouponValidationResponse, Error, ValidateCouponRequest>({
    mutationFn: couponApi.validateCoupon,
    onError: (error) => {
      console.error("Coupon validation failed:", error);
    },
  });
}

/**
 * Hook to fetch available coupons for the user
 * Based on order type and amount
 */
export function useAvailableCoupons(params: ListCouponsParams) {
  return useQuery<ListCouponsResponse>({
    queryKey: couponKeys.available(params),
    queryFn: () => couponApi.listAvailableCoupons(params),
    enabled: params.order_amount > 0,
    staleTime: 60_000, // 1 minute
  });
}
