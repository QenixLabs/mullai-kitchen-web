import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
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
    const response = await apiClient.get<PaginatedPlanResponse>(CUSTOMER_ROUTES.PLANS, {
      params,
    });
    return response.data;
  },
  getMenuPreview: async (planId: string): Promise<MenuPreviewResponse> => {
    const response = await apiClient.get<MenuPreviewResponse>(
      CUSTOMER_ROUTES.MENU_PREVIEW(planId),
    );
    return response.data;
  },
  checkServiceability: async (payload: { pincode: string }): Promise<ServiceabilityResponse> => {
    const response = await apiClient.post<ServiceabilityResponse>(
      CUSTOMER_ROUTES.SERVICEABILITY_CHECK,
      payload,
    );
    return response.data;
  },
  prepareCheckout: async (
    payload: PrepareCheckoutRequest,
  ): Promise<CheckoutPreviewResponse> => {
    const response = await apiClient.post<CheckoutPreviewResponse>(
      CUSTOMER_ROUTES.CHECKOUT_PREPARE,
      payload,
    );
    return response.data;
  },
  createCheckoutOrder: async (
    payload: CreateCheckoutOrderRequest,
  ): Promise<CheckoutPreviewResponse> => {
    const response = await apiClient.post<CheckoutPreviewResponse>(
      CUSTOMER_ROUTES.CHECKOUT_CREATE_ORDER,
      payload,
    );
    return response.data;
  },
};
