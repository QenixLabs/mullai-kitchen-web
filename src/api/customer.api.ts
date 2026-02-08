import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
import type { ApiResponse } from "@/api/types/api-response.types";
import type {
  CheckoutPreviewResponse,
  CreateCheckoutOrderRequest,
  MenuPreviewResponse,
  PaginatedPlanResponse,
  PrepareCheckoutRequest,
  QueryCustomerPlans,
  ServiceabilityResponse,
} from "@/api/types/customer.types";

export const customerApi = {
  getPlans: async (params?: QueryCustomerPlans): Promise<PaginatedPlanResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedPlanResponse>>(CUSTOMER_ROUTES.PLANS, {
      params,
    });
    return response.data.data;
  },
  getMenuPreview: async (planId: string): Promise<MenuPreviewResponse> => {
    const response = await apiClient.get<ApiResponse<MenuPreviewResponse>>(
      CUSTOMER_ROUTES.MENU_PREVIEW(planId),
    );
    return response.data.data;
  },
  checkServiceability: async (payload: { pincode: string }): Promise<ServiceabilityResponse> => {
    const response = await apiClient.post<ApiResponse<ServiceabilityResponse>>(
      CUSTOMER_ROUTES.SERVICEABILITY_CHECK,
      payload,
    );
    return response.data.data;
  },
  prepareCheckout: async (
    payload: PrepareCheckoutRequest,
  ): Promise<{ data: CheckoutPreviewResponse }> => {
    const response = await apiClient.post<ApiResponse<{ data: CheckoutPreviewResponse }>>(
      CUSTOMER_ROUTES.CHECKOUT_PREPARE,
      payload,
    );
    return response.data.data;
  },
  createCheckoutOrder: async (
    payload: CreateCheckoutOrderRequest,
  ): Promise<{ data: CheckoutPreviewResponse }> => {
    const response = await apiClient.post<ApiResponse<{ data: CheckoutPreviewResponse }>>(
      CUSTOMER_ROUTES.CHECKOUT_CREATE_ORDER,
      payload,
    );
    return response.data.data;
  },
};
