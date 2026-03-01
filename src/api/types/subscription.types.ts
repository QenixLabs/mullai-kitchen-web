// ===========================================
// Subscription Management Types
// ===========================================

// ===========================================
// Enums
// ===========================================

/**
 * Subscription Status Enum
 * Defines the different states of a customer subscription
 */
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'PENDING_RENEWAL';

/**
 * Subscription Renewal Status Enum
 * Defines the lifecycle status of subscription renewals
 */
export type SubscriptionRenewalStatus =
  | 'ELIGIBLE'
  | 'PENDING_RENEWAL'
  | 'RENEWED'
  | 'EXPIRED'
  | 'CANCELLED';

/**
 * Meal Type Enum
 * Defines the different meal types available
 */
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

/**
 * Pause Credit Status Enum
 * Defines the status of pause credit processing
 */
export type PauseCreditStatus = 'PENDING_CREDIT' | 'CREDITED' | 'CANCELLED';

/**
 * Pause Period Status Enum
 * Defines the different states of a subscription pause period
 */
export type PausePeriodStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * Cancellation Option Enum
 * Defines options for subscription cancellation
 */
export type CancellationOption = 'CANCEL_ALL' | 'CANCEL_RENEWAL';

/**
 * Daily Order Status Enum
 * Defines the different states of a daily meal order
 */
export type DailyOrderStatus =
  | 'PLANNED'
  | 'LOCKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'MISSED'
  | 'PAUSED'
  | 'CANCELLED';

// ===========================================
// Response Types
// ===========================================

/**
 * Subscription List Response
 * Response containing list of subscriptions with pagination
 */
export interface SubscriptionListResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Subscription Response (List Item)
 * Simplified representation for subscription listing
 */
export interface SubscriptionResponse {
  _id: string;
  plan_id: string;
  plan_name: string;
  meals_included: MealType[];
  user_id: string;
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
  renewal_status: SubscriptionRenewalStatus;
  outlet_id: string;
  outlet_name?: string;
  is_cancellable: boolean;
  cancellation_cutoff_time?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Subscription Detail Response
 * Complete subscription information with all details
 */
export interface SubscriptionDetailResponse extends SubscriptionResponse {
  renewal_subscription_id?: string;
  parent_subscription_id?: string;
  order_generation_window?: number;
  last_order_generated_date?: string;
  cancellation_reason?: string;
  cancellation_option?: CancellationOption;
  cancelled_at?: string;
}

/**
 * Subscription Interface
 * Full subscription model
 */
export interface Subscription {
  _id: string;
  plan_id: string;
  plan_name: string;
  meals_included: MealType[];
  user_id: string;
  address_id: string;
  full_address: string;
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date;
  renewal_date?: Date;
  total_deliveries?: number;
  completed_deliveries: number;
  remaining_deliveries?: number;
  paused_deliveries: number;
  auto_renew: boolean;
  renewal_status: SubscriptionRenewalStatus;
  renewal_subscription_id?: string;
  parent_subscription_id?: string;
  order_generation_window?: number;
  last_order_generated_date?: Date;
  outlet_id: string;
  outlet_name?: string;
  is_cancellable: boolean;
  cancellation_cutoff_time?: string;
  cancellation_reason?: string;
  cancellation_option?: CancellationOption;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Daily Order Interface
 * Individual daily meal order within a subscription
 */
export interface DailyOrder {
  _id: string;
  subscription_id: string;
  date: Date;
  meal_type: MealType;
  recipe_id: string;
  recipe_name: string;
  status: DailyOrderStatus;
  state?: string;
  pause_credit: number;
  delivery_route_id?: string;
  route_sequence?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Daily Orders Response
 * Response containing daily orders for a subscription
 */
export interface DailyOrdersResponse {
  subscription_id: string;
  orders: DailyOrder[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Refunded Add-On Interface
 * Interface for refunded add-on items during pause period
 */
export interface RefundedAddOn {
  add_on_order_id: string;
  item_ids: string[];
  amount: number;
}

/**
 * Pause Period Interface
 * Pause period for subscriptions
 */
export interface PausePeriod {
  _id: string;
  subscription_id: string;
  start_date: Date;
  end_date: Date;
  days_paused?: number;
  reason?: string;
  paused_dates: Date[];
  credit_amount?: number;
  credited_to_wallet: boolean;
  credit_status: PauseCreditStatus;
  credit_processed_at?: Date;
  status: PausePeriodStatus;
  add_ons_refunded: RefundedAddOn[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Pause Periods Response
 * Response containing pause periods for a subscription
 */
export interface PausePeriodsResponse {
  subscription_id: string;
  pause_periods: PausePeriod[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ===========================================
// Request Types (DTOs)
// ===========================================

/**
 * Pause Subscription Request
 * Request to pause a subscription
 */
export interface PauseSubscriptionRequest {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  reason?: string;
  credit_to_wallet?: boolean; // Default: false (shifts dates)
}

/**
 * Resume Subscription Request
 * Request to resume a paused subscription
 */
export interface ResumeSubscriptionRequest {
  pause_period_id: string;
  resume_date?: string; // ISO date string (optional, defaults to immediately)
}

/**
 * Cancel Subscription Request
 * Request to cancel a subscription
 */
export interface CancelSubscriptionRequest {
  cancellation_option: CancellationOption;
  reason?: string;
}

/**
 * Renew Subscription Request
 * Request to renew an expired or cancelled subscription
 */
export interface RenewSubscriptionRequest {
  subscription_id: string;
  start_date?: string; // ISO date string (optional, defaults to next available date)
}

/**
 * Toggle Auto Renew Request
 * Request to toggle auto-renewal for a subscription
 */
export interface ToggleAutoRenewRequest {
  auto_renew: boolean;
}

// ===========================================
// Query Types
// ===========================================

/**
 * Query Subscriptions Parameters
 */
export interface QuerySubscriptionsParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  renewal_status?: SubscriptionRenewalStatus;
  auto_renew?: boolean;
  sort_by?: 'start_date' | 'end_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

/**
 * Query Daily Orders Parameters
 */
export interface QueryDailyOrdersParams {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  status?: DailyOrderStatus;
  meal_type?: MealType;
  sort_by?: 'date' | 'status';
  sort_order?: 'asc' | 'desc';
}

/**
 * Query Pause Periods Parameters
 */
export interface QueryPausePeriodsParams {
  page?: number;
  limit?: number;
  status?: PausePeriodStatus;
  credit_status?: PauseCreditStatus;
  sort_by?: 'start_date' | 'created_at';
  sort_order?: 'asc' | 'desc';
}
