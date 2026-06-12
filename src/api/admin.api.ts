import { apiClient } from "@/api/client";
import type {
  IDashboardResponse,
  IOperationsReportQuery,
  IOperationsReportItem,
  IFinancialReportQuery,
  IFinancialReportResponse,
  IRevenueAnalyticsQuery,
  IRevenueAnalyticsResponse,
} from "@/api/types/admin.types";
import type { KitchenReportResponse } from "@/api/types/kitchen-report.types";
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
  getRevenueAnalytics: async (params: IRevenueAnalyticsQuery): Promise<IRevenueAnalyticsResponse> => {
    const response = await apiClient.get<IRevenueAnalyticsResponse>(ADMIN_ROUTES.REPORTS_REVENUE_ANALYTICS, { params });
    return response.data;
  },
  getKitchenReport: async (outletId: string, date?: string): Promise<KitchenReportResponse> => {
    const response = await apiClient.get<KitchenReportResponse>(
      ADMIN_ROUTES.KITCHEN_REPORT(outletId),
      { params: date ? { date } : {} },
    );
    return response.data;
  },
  downloadKitchenPdf: async (outletId: string, date?: string): Promise<Blob> => {
    const response = await apiClient.get(
      ADMIN_ROUTES.KITCHEN_REPORT_PDF(outletId),
      { params: date ? { date } : {}, responseType: 'blob' },
    );
    return response.data;
  },
};
