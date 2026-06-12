// Enums mirroring backend (values must match server/src/db/enums exactly)
export enum PlanStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PlanDuration {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
}

export enum PlanType {
  PRE_DEFINED = 'PRE_DEFINED',
  CUSTOM = 'CUSTOM',
}

export enum FoodPreference {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
}

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PausePeriodStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum PauseCreditStatus {
  PENDING_CREDIT = 'PENDING_CREDIT',
  CREDITED = 'CREDITED',
  CANCELLED = 'CANCELLED',
}

// Plan types
export interface Plan {
  _id: string;
  name: string;
  description?: string;
  image_url?: string;
  duration: PlanDuration;
  meals_included: MealType[];
  price: number;
  status: PlanStatus;
  outlet_restriction?: string | null;
  valid_from: string;
  valid_until?: string;
  max_subscribers?: number;
  current_subscribers: number;
  plan_type: PlanType;
  veg_price?: number;
  nonveg_price?: number;
  uses_outlet_pricing?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanPayload {
  name: string;
  description?: string;
  image_url?: string;
  duration: PlanDuration;
  meals_included: MealType[];
  price: number;
  status?: PlanStatus;
  outlet_restriction?: string | null;
  valid_from: string;
  valid_until?: string;
  max_subscribers?: number;
  plan_type?: PlanType;
}

export type UpdatePlanPayload = Partial<CreatePlanPayload>;

export interface PlanListParams {
  status?: PlanStatus;
  plan_type?: PlanType;
  duration?: PlanDuration;
  outlet_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlanListResponse {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Subscription types
export interface AdminSubscription {
  _id: string;
  plan_id: string;
  plan_name: string;
  meals_included: MealType[];
  user_id: string | { _id: string; name: string; email: string };
  address_id: string;
  full_address: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  total_deliveries?: number;
  completed_deliveries: number;
  remaining_deliveries?: number;
  paused_deliveries: number;
  auto_renew: boolean;
  total_amount: number;
  outlet_id: string;
  outlet_name: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSubscriptionListParams {
  outlet_id?: string;
  status?: SubscriptionStatus;
  plan_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminSubscriptionListResponse {
  data: AdminSubscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminPausePayload {
  paused_dates: string[];
  reason?: string;
}

export interface AdminResumePayload {
  pause_period_id: string;
  reason?: string;
}

export interface AdminSkipDatesPayload {
  dates: string[];
  reason?: string;
}

export interface PausePeriod {
  _id: string;
  subscription_id: string;
  paused_dates: string[];
  days_paused: number;
  reason?: string;
  credit_amount: number;
  credited_to_wallet: boolean;
  credit_status: PauseCreditStatus;
  status: PausePeriodStatus;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionActivityResponse {
  data: PausePeriod[];
}
