// ===========================================
// Corporate Order Management Types
// ===========================================

// ===========================================
// Corporate Profile Types
// ===========================================

/**
 * Corporate Delegate Information
 * Represents the authorized contact person for a corporate account
 */
export interface ICorporateDelegate {
  name: string;
  designation: string;
  phone?: string;
  email?: string;
}

/**
 * Corporate Billing Address
 * Registered billing address for a corporate account
 */
export interface IBillingAddress {
  street_address: string;
  city: string;
  pincode: string;
  area_landmark: string;
  state_country: string;
}

/**
 * Corporate Delivery Address
 * Individual delivery location associated with a corporate account
 */
export interface IDeliveryAddress {
  label: string;
  full_address: string;
  street_address?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_default: boolean;
  lat?: number;
  lng?: number;
}

/**
 * Corporate Profile
 * Full corporate profile response from the API
 */
export interface ICorporateProfile {
  _id: string;
  user_id: string;
  company_name: string;
  gst_number?: string;
  pan_number?: string;
  delegate: ICorporateDelegate;
  billing_address: IBillingAddress;
  delivery_addresses: IDeliveryAddress[];
  created_at: string;
  updated_at: string;
}

// ===========================================
// Corporate Profile DTOs
// ===========================================

/**
 * Add Delivery Address DTO
 * Payload for adding a new delivery address to a corporate profile
 */
export interface AddDeliveryAddressDto {
  label: string;
  full_address: string;
  street_address?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_default?: boolean;
  lat?: number;
  lng?: number;
}

/**
 * Create Corporate Profile DTO
 * Payload for creating a new corporate profile
 */
export interface CreateCorporateProfileDto {
  company_name: string;
  gst_number?: string;
  pan_number?: string;
  delegate: ICorporateDelegate;
  billing_address: IBillingAddress;
}

/**
 * Update Corporate Profile DTO
 * Payload for updating an existing corporate profile (all fields optional)
 */
export interface UpdateCorporateProfileDto {
  company_name?: string;
  gst_number?: string;
  pan_number?: string;
  delegate?: Partial<ICorporateDelegate>;
  billing_address?: Partial<IBillingAddress>;
}

// ===========================================
// Enums
// ===========================================

/**
 * Corporate Order Status Enum
 * Defines the different states of a corporate order
 */
export const CorporateOrderStatus = {
  DRAFT: 'draft',
  PENDING_PAYMENT: 'pending_payment',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type CorporateOrderStatus = (typeof CorporateOrderStatus)[keyof typeof CorporateOrderStatus];

/**
 * Corporate Payment Status Enum
 * Defines the payment status of a corporate order
 */
export const CorporatePaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
} as const;
export type CorporatePaymentStatus = (typeof CorporatePaymentStatus)[keyof typeof CorporatePaymentStatus];

/**
 * Corporate Invoice Type Enum
 * Defines the type of invoice (proforma or final)
 */
export const CorporateInvoiceType = {
  PROFORMA: 'proforma',
  CYCLE: 'cycle',
} as const;
export type CorporateInvoiceType = (typeof CorporateInvoiceType)[keyof typeof CorporateInvoiceType];

/**
 * Corporate Invoice Status Enum
 * Defines the status of a corporate invoice
 */
export const CorporateInvoiceStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;
export type CorporateInvoiceStatus = (typeof CorporateInvoiceStatus)[keyof typeof CorporateInvoiceStatus];

// ===========================================
// Request Types
// ===========================================

/**
 * Create Corporate Order Request
 * Request body for creating a new corporate bulk order
 */
export interface ICreateCorporateOrderRequest {
  delivery_address: {
    address_line: string;
    area: string;
    landmark?: string;
    pincode: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
  };
  selected_days: string[];
  meal_types: string[];
  start_date: string;
  end_date: string;
  billing_cycle_days?: number;
  headcount: number;
  veg_count: number;
  nonveg_count: number;
  notes?: string;
}

/**
 * Modify Corporate Order Request
 * Request body for modifying meals on a specific date
 */
export interface IModifyCorporateOrderRequest {
  modification_date: string;
  veg_change: number;
  nonveg_change: number;
  reason?: string;
}

// ===========================================
// Response Types
// ===========================================

/**
 * Corporate Order Interface
 * Full corporate order response from the API
 */
export interface ICorporateOrder {
  _id: string;
  order_id: string;
  corporate_id: string;
  company_name: string;
  outlet_id: string;
  outlet_name: string;
  delivery_address: {
    address_line: string;
    area: string;
    landmark?: string;
    pincode: string;
    city: string;
    state: string;
  };
  selected_days: string[];
  meal_types: string[];
  start_date: string;
  end_date: string;
  total_delivery_days: number;
  headcount: number;
  veg_count: number;
  nonveg_count: number;
  veg_price_per_meal: number;
  nonveg_price_per_meal: number;
  delivery_charge_per_day: number;
  tax_rate: number;
  proforma_amount: number;
  total_modification_amount: number;
  billing_cycle_days: number;
  current_billing_start: string;
  final_amount: number;
  payment_status: CorporatePaymentStatus;
  status: CorporateOrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Corporate Order Modification Interface
 * Represents a meal reduction modification on a specific date
 */
export interface ICorporateOrderModification {
  _id: string;
  corporate_order_id: string;
  modification_date: string;
  veg_change: number;
  nonveg_change: number;
  reason?: string;
  modification_amount: number;
  status: string;
  created_at: string;
}

/**
 * Corporate Invoice Line Item Interface
 * Individual line item on a corporate invoice
 */
export interface ICorporateInvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

/**
 * Corporate Invoice Interface
 * Full corporate invoice response from the API
 */
export interface ICorporateInvoice {
  _id: string;
  invoice_number: string;
  corporate_order_id: string;
  company_name: string;
  outlet_name: string;
  type: CorporateInvoiceType;
  billing_period_start?: string;
  billing_period_end?: string;
  cycle_number?: number;
  line_items: ICorporateInvoiceLineItem[];
  modifications: {
    date: string;
    veg_change: number;
    nonveg_change: number;
    modification_amount: number;
  }[];
  subtotal: number;
  total_modification: number;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: CorporateInvoiceStatus;
  paid_at?: string;
  due_date?: string;
  created_at: string;
}

/**
 * Current Billing Cycle Info
 * Information about the current billing cycle
 */
export interface ICurrentBillingCycle {
  number: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isComplete: boolean;
}

/**
 * All Invoices Response
 * Response structure for fetching all invoices for a corporate order
 */
export interface IAllInvoicesResponse {
  proforma: ICorporateInvoice | null;
  cycles: ICorporateInvoice[];
  currentCycle: ICurrentBillingCycle;
  totalExpectedCycles: number;
  orderStartDate: string;
  orderEndDate: string;
}

/**
 * Create Corporate Order Response
 * Response structure when creating a new corporate order
 */
export interface ICreateCorporateOrderResponse {
  order: ICorporateOrder;
  invoice: ICorporateInvoice;
}

/**
 * Corporate Daily Order Interface
 * Represents a single day's meal order within a corporate subscription
 */
export interface ICorporateDailyOrder {
  _id: string;
  corporate_order_id: string;
  order_id?: string;
  company_name?: string;
  date: string;
  veg_count: number;
  nonveg_count: number;
  total_meals: number;
  status: string;
  modification_id?: string;
  delivery_route_id?: string;
  route_sequence?: number;
  delivery_address: ICorporateOrder['delivery_address'];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===========================================
// Corporate Order Pricing Types
// ===========================================

/**
 * Corporate Order Pricing Query Params
 * Query parameters for fetching real-time pricing preview
 */
export interface ICorporatePricingParams {
  outlet_id: string;
  veg_count: number;
  nonveg_count: number;
  meal_types: string[];
  selected_days: string[];
  start_date: string;
  end_date: string;
}

/**
 * Corporate Order Pricing Response
 * Pricing breakdown from the backend, computed from outlet config
 */
export interface ICorporatePricingResponse {
  veg_price_per_meal: number;
  nonveg_price_per_meal: number;
  delivery_charge_per_day: number;
  tax_rate: number;
  total_delivery_days: number;
  veg_meals: number;
  nonveg_meals: number;
  veg_amount: number;
  nonveg_amount: number;
  delivery_total: number;
  subtotal: number;
  tax: number;
  grand_total: number;
}
