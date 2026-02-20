import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
import type { ApiResponse } from "@/api/types/api-response.types";
import type {
  CreateCustomPlanDto,
  CustomPlanResponse,
  PaginatedCustomPlansResponse,
  QueryCustomPlans,
  UpdateCustomPlanDto,
} from "@/api/types/customer.types";

export const customPlanApi = {
  create: async (payload: CreateCustomPlanDto): Promise<{ data: CustomPlanResponse }> => {
    const response = await apiClient.post<ApiResponse<{ data: CustomPlanResponse }>>(
      CUSTOMER_ROUTES.CUSTOM_PLANS,
      payload
    );
    return response.data.data;
  },

  list: async (params?: QueryCustomPlans): Promise<PaginatedCustomPlansResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedCustomPlansResponse>>(
      CUSTOMER_ROUTES.CUSTOM_PLANS,
      { params }
    );
    return response.data.data;
  },

  getById: async (planId: string): Promise<{ data: CustomPlanResponse }> => {
    const response = await apiClient.get<ApiResponse<{ data: CustomPlanResponse }>>(
      CUSTOMER_ROUTES.CUSTOM_PLAN(planId)
    );
    return response.data.data;
  },

  update: async (
    planId: string,
    payload: UpdateCustomPlanDto
  ): Promise<{ data: CustomPlanResponse }> => {
    const response = await apiClient.patch<ApiResponse<{ data: CustomPlanResponse }>>(
      CUSTOMER_ROUTES.CUSTOM_PLAN(planId),
      payload
    );
    return response.data.data;
  },

  delete: async (planId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      CUSTOMER_ROUTES.CUSTOM_PLAN(planId)
    );
    return response.data.data;
  },
};
