// ===========================================
// Menu Types
// ===========================================

// ─── Enums ───────────────────────────────────────────────────────
export enum RecipeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
}

export enum WeekDay {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

// ===========================================
// Recipe Types
// ===========================================

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface CookingDetails {
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  instructions?: string[];
}

export interface Nutrition {
  calories?: number;
  protein?: string;
  carbs?: string;
}

export interface Recipe {
  _id: string;
  name: string;
  description?: string;
  cuisine_type?: string;
  difficulty?: string;
  ingredients: Ingredient[];
  cooking_details?: CookingDetails;
  nutrition?: Nutrition;
  image_url?: string;
  status: RecipeStatus;
  outlet_restriction?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecipePayload {
  name: string;
  description?: string;
  cuisine_type?: string;
  difficulty?: string;
  ingredients?: Ingredient[];
  cooking_details?: CookingDetails;
  nutrition?: Nutrition;
  image_url?: string;
  outlet_restriction?: string | null;
}

export interface RecipeListParams {
  status?: RecipeStatus;
  cuisine_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RecipeListResponse {
  data: Recipe[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecipeSelectItem {
  _id: string;
  name: string;
}

// ===========================================
// Weekly Meal Template Types
// ===========================================

export interface WeeklyMealTemplate {
  _id: string;
  outlet_id: string;
  day_of_week: WeekDay;
  meal_type: MealType;
  veg_recipe_id?: string;
  nonveg_recipe_id?: string;
  effective_from: string;
  effective_until?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplatePayload {
  day_of_week: WeekDay;
  meal_type: MealType;
  veg_recipe_id?: string;
  nonveg_recipe_id?: string;
  effective_from: string;
  effective_until?: string;
  is_published?: boolean;
}

export interface TemplateListParams {
  day_of_week?: WeekDay;
  meal_type?: MealType;
  effective_from?: string;
  effective_until?: string;
  is_published?: boolean;
  page?: number;
  limit?: number;
}

export interface TemplateListResponse {
  data: WeeklyMealTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkCopyPayload {
  source_outlet_id: string;
  source_effective_from: string;
  target_outlet_id: string;
  target_effective_from: string;
  day_of_week?: WeekDay;
}

// ===========================================
// Meal Roster Override Types
// ===========================================

export interface MealRosterOverride {
  _id: string;
  outlet_id: string;
  date: string;
  meal_type: MealType;
  veg_recipe_id?: string;
  nonveg_recipe_id?: string;
  is_closed: boolean;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOverridePayload {
  date: string;
  meal_type: MealType;
  veg_recipe_id?: string;
  nonveg_recipe_id?: string;
  is_closed?: boolean;
  reason?: string;
}

export interface OverrideListParams {
  date_from?: string;
  date_until?: string;
  meal_type?: MealType;
  page?: number;
  limit?: number;
}

export interface OverrideListResponse {
  data: MealRosterOverride[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
