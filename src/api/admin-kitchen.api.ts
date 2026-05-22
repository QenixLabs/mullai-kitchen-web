import { apiClient } from '@/api/client';

export interface KitchenReportItem {
  recipe_name: string;
  meal_type: string;
  veg_count: number;
  nonveg_count: number;
  total: number;
}

export interface KitchenReportCorporateItem {
  corporate_order_id: string;
  order_id?: string;
  company_name: string;
  veg_count: number;
  nonveg_count: number;
  total_meals: number;
  delivery_address?: {
    address_line: string;
    area: string;
    landmark?: string;
    pincode: string;
    city: string;
    state: string;
  };
  meal_types: string[];
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
  corporate_summary?: Record<string, number>;
  combined_summary?: Record<string, number>;
  corporate_items?: KitchenReportCorporateItem[];
}

export interface IngredientConsumptionProjection {
  ingredient_id: string;
  ingredient_name: string;
  total_quantity: number;
  unit: string;
  recipes: Array<{
    recipe_id: string;
    count: number;
    quantity_per_recipe: number;
    wastage_factor: number;
  }>;
}

export const adminKitchenApi = {
  getReport: async (outletId: string, date?: string): Promise<KitchenReport> => {
    const response = await apiClient.get<KitchenReport>(`/admin/outlets/${outletId}/kitchen-report`, {
      params: { date },
    });
    return response.data;
  },

  getConsumptionProjection: async (
    outletId: string,
    date?: string,
  ): Promise<IngredientConsumptionProjection[]> => {
    const response = await apiClient.get<IngredientConsumptionProjection[]>(
      `/admin/inventory/consumption-projection`,
      {
        params: { outlet_id: outletId, date },
      },
    );
    return response.data;
  },
};
