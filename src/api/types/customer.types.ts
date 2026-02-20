// ===========================================
// Address Types
// ===========================================

export type AddressType = 'HOME' | 'OFFICE' | 'OTHER';

export interface Address {
  _id: string;
  user_id: string;
  type: AddressType;
  full_address: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  landmark?: string;
  mapped_outlet_id: string;
  mapped_outlet_name?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressDto {
  type: AddressType;
  full_address: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  landmark?: string;
}

export interface UpdateProfileDto {
  dietary_preferences?: string;
  special_instructions?: string;
  preferred_contact_time?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// ===========================================
// Serviceability & Checkout Types
// ===========================================

export interface ServiceabilityInfo {
  is_serviceable: boolean;
  outlet?: {
    id: string;
    name?: string;
  };
  message?: string;
}

export interface ServiceabilityResponse {
  isServiceable: boolean;
  outlet: {
    _id: string;
    [key: string]: unknown;
  } | null;
}

// ===========================================
// Plan Types
// ===========================================

export interface QueryCustomerPlans {
  page?: number;
  limit?: number;
  duration?: string;
  meal_types?: string[];
  pincode?: string;
}

export interface PlanBrowseItem {
  _id: string;
  name: string;
  description?: string;
  duration: string;
  meals_included: string[];
  price: number;
  valid_from: string;
  valid_until?: string;
  image_url?: string;
  rating?: number;
  badge?: string;
}

export interface PaginatedPlanResponse {
  plans: PlanBrowseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  serviceability?: ServiceabilityInfo;
}

// ===========================================
// Menu Types
// ===========================================

export interface MenuPreviewMeal {
  meal_type: string;
  recipe_id: string;
  recipe_name: string;
}

export interface MenuPreviewDay {
  day: string;
  meals: MenuPreviewMeal[];
}

export interface MenuPreviewResponse {
  plan_id: string;
  menu: MenuPreviewDay[];
}

// ===========================================
// Checkout Types
// ===========================================

export interface CheckoutPreviewResponse {
  plan: {
    _id: string;
    name: string;
    description?: string;
    duration: string;
    meals_included: string[];
    price: number;
  };
  address: {
    _id: string;
    full_address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    mapped_outlet_id: string;
    mapped_outlet_name?: string;
  };
  start_date: string;
}

export interface PrepareCheckoutRequest {
  plan_id: string;
  address_id: string;
  start_date: string;
}

export interface CreateCheckoutOrderRequest {
  plan_id: string;
  address_id: string;
  start_date: string;
}

// ===========================================
// Custom Plan Types
// ===========================================

export interface CreateCustomPlanDto {
  custom_days: number;
  custom_meal_types: string[];
  custom_preference: 'VEG' | 'NON_VEG';
  start_date: string;
  address_id: string;
}

export interface UpdateCustomPlanDto {
  custom_days?: number;
  custom_meal_types?: string[];
  custom_preference?: 'VEG' | 'NON_VEG';
  start_date?: string;
  address_id?: string;
}

export interface QueryCustomPlans {
  page?: number;
  limit?: number;
}

export interface CustomPlan {
  _id: string;
  name: string;
  description: string;
  custom_days: number;
  custom_meal_types: string[];
  custom_preference: 'VEG' | 'NON_VEG';
  meals_included: string[];
  price: number;
  veg_price: number;
  nonveg_price: number;
  outlet_restriction?: string;
  valid_from: string;
  address?: {
    _id: string;
    full_address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    mapped_outlet_id: string;
  };
  created_at: string;
}

export interface CustomPlanResponse {
  _id: string;
  name: string;
  description: string;
  custom_days: number;
  custom_meal_types: string[];
  custom_preference: 'VEG' | 'NON_VEG';
  meals_included: string[];
  price: number;
  veg_price: number;
  nonveg_price: number;
  outlet_restriction?: string;
  valid_from: string;
  address?: {
    _id: string;
    full_address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    mapped_outlet_id: string;
  };
  created_at: string;
}

export interface PaginatedCustomPlansResponse {
  plans: CustomPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
