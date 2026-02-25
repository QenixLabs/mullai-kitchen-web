import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
import type {
  CreateCustomPlanDto,
  CustomPlanMenuPreviewParams,
  CustomPlanMenuPreviewResponse,
  CustomPlanPricingResponse,
  CustomPlanResponse,
  PaginatedCustomPlansResponse,
  QueryCustomPlans,
  UpdateCustomPlanDto,
} from "@/api/types/customer.types";

export const customPlanApi = {
  create: async (payload: CreateCustomPlanDto): Promise<CustomPlanResponse> => {
    const response = await apiClient.post<CustomPlanResponse>(
      CUSTOMER_ROUTES.CUSTOM_PLANS,
      payload,
    );
    return response.data;
  },

  list: async (
    params?: QueryCustomPlans,
  ): Promise<PaginatedCustomPlansResponse> => {
    const response = await apiClient.get<PaginatedCustomPlansResponse>(
      CUSTOMER_ROUTES.CUSTOM_PLANS,
      { params },
    );
    return response.data;
  },

  getById: async (planId: string): Promise<CustomPlanResponse> => {
    const response = await apiClient.get<CustomPlanResponse>(
      CUSTOMER_ROUTES.CUSTOM_PLAN(planId),
    );
    return response.data;
  },

  update: async (
    planId: string,
    payload: UpdateCustomPlanDto,
  ): Promise<CustomPlanResponse> => {
    const response = await apiClient.patch<CustomPlanResponse>(
      CUSTOMER_ROUTES.CUSTOM_PLAN(planId),
      payload,
    );
    return response.data;
  },

  delete: async (planId: string): Promise<boolean> => {
    const response = await apiClient.delete<{ success: boolean }>(
      CUSTOMER_ROUTES.CUSTOM_PLAN(planId),
    );
    return response.data.success;
  },

  getPricing: async (
    params: CustomPlanMenuPreviewParams,
  ): Promise<CustomPlanPricingResponse> => {
    const response = await apiClient.get<CustomPlanPricingResponse>(
      CUSTOMER_ROUTES.CUSTOM_PLAN_PRICING,
      { params },
    );
    return response.data;
  },

  getMenuPreview: async (
    params: CustomPlanMenuPreviewParams,
  ): Promise<CustomPlanMenuPreviewResponse> => {
    const response = await apiClient.get<CustomPlanMenuPreviewResponse>(
      CUSTOMER_ROUTES.CUSTOM_PLAN_MENU_PREVIEW(
        params.preference,
        params.meal_types,
        params.days,
      ),
    );
    return response.data;
  },
};
