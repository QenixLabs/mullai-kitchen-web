export interface RecipeBreakdownItem {
  recipe_id: string;
  recipe_name: string;
  veg_count: number;
  nonveg_count: number;
  total: number;
}

export interface MealTypeBreakdown {
  veg: number;
  nonveg: number;
  total: number;
  recipes: RecipeBreakdownItem[];
}

export interface IndividualBreakdown {
  breakfast: MealTypeBreakdown;
  lunch: MealTypeBreakdown;
  dinner: MealTypeBreakdown;
  total: { veg: number; nonveg: number; total: number };
  source_breakdown: {
    subscription_orders: number;
    addon_orders: number;
  };
}

export interface CorporateCompanyItem {
  corporate_order_id: string;
  order_id: string;
  company_name: string;
  veg_count: number;
  nonveg_count: number;
  total_meals: number;
  delivery_address: {
    address_line?: string;
    area?: string;
    landmark?: string;
    pincode?: string;
    city?: string;
    state?: string;
  };
}

export interface CorporateBreakdown {
  companies: CorporateCompanyItem[];
  by_meal_type: {
    breakfast: { veg: number; nonveg: number; total: number };
    lunch: { veg: number; nonveg: number; total: number };
    dinner: { veg: number; nonveg: number; total: number };
  };
  total: { veg: number; nonveg: number; total: number };
}

export interface CombinedMealTypeEntry {
  individual: { veg: number; nonveg: number; total: number };
  corporate: { veg: number; nonveg: number; total: number };
  combined: { veg: number; nonveg: number; total: number };
}

export interface KitchenReportResponse {
  date: string;
  outlet: { id: string; name: string };
  individual: IndividualBreakdown;
  corporate: CorporateBreakdown;
  combined: {
    by_meal_type: {
      breakfast: CombinedMealTypeEntry;
      lunch: CombinedMealTypeEntry;
      dinner: CombinedMealTypeEntry;
    };
    total: { veg: number; nonveg: number; total: number };
  };
}
