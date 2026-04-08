import { apiClient } from "@/api/client";
import type { IDashboardResponse } from "@/api/types/admin.types";
import { ADMIN_ROUTES } from "@/api/routes";

export const adminApi = {
  getDashboardData: async (): Promise<IDashboardResponse> => {
    const response = await apiClient.get<IDashboardResponse>(ADMIN_ROUTES.DASHBOARD);
    return response.data;
  },
};
