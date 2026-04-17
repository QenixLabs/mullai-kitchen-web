import { apiClient } from '@/api/client';

export interface KitchenReportItem {
  recipe_name: string;
  meal_type: string;
  veg_count: number;
  nonveg_count: number;
  total: number;
}

export interface KitchenReportSummary {
  breakfast_count: number;
  lunch_count: number;
  dinner_count: number;
  total: number;
}

export interface KitchenReport {
  summary: KitchenReportSummary;
  items: KitchenReportItem[];
}

export const adminKitchenApi = {
  getReport: async (outletId: string, date?: string): Promise<KitchenReport> => {
    const response = await apiClient.get<KitchenReport>(`/admin/outlets/${outletId}/kitchen-report`, {
      params: { date },
    });
    return response.data;
  },
};
