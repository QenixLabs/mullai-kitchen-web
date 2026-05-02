import { apiClient } from "@/api/client";
import type {
  IDashboardResponse,
  IOperationsReportQuery,
  IOperationsReportItem,
  IFinancialReportQuery,
  IFinancialReportResponse,
} from "@/api/types/admin.types";
import { ADMIN_ROUTES } from "@/api/routes";

export const adminApi = {
  getDashboardData: async (): Promise<IDashboardResponse> => {
    const response = await apiClient.get<IDashboardResponse>(ADMIN_ROUTES.DASHBOARD);
    return response.data;
  },
  getOperationsReport: async (params: IOperationsReportQuery): Promise<IOperationsReportItem[]> => {
    const response = await apiClient.get<IOperationsReportItem[]>(ADMIN_ROUTES.REPORTS_OPERATIONS, { params });
    return response.data;
  },
  getFinancialReport: async (params: IFinancialReportQuery): Promise<IFinancialReportResponse> => {
    const response = await apiClient.get<IFinancialReportResponse>(ADMIN_ROUTES.REPORTS_FINANCIAL, { params });
    return response.data;
  },
};
