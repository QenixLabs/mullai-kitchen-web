// ===========================================
// Corporate Order Management Types
// ===========================================

// ===========================================
// Enums
// ===========================================

/**
 * Corporate Order Status Enum
 * Defines the different states of a corporate order
 */
export type CorporateOrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'active'
  | 'completed'
  | 'cancelled';

/**
 * Corporate Payment Status Enum
 * Defines the payment status of a corporate order
 */
export type CorporatePaymentStatus = 'pending' | 'paid' | 'overdue';

/**
 * Corporate Invoice Type Enum
 * Defines the type of invoice (proforma or final)
 */
export type CorporateInvoiceType = 'proforma' | 'final';

/**
 * Corporate Invoice Status Enum
 * Defines the status of a corporate invoice
 */
export type CorporateInvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

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
  duration_weeks: number;
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
  veg_reduction: number;
  nonveg_reduction: number;
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
  total_reduction_amount: number;
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
  veg_reduction: number;
  nonveg_reduction: number;
  reason?: string;
  credit_amount: number;
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
  line_items: ICorporateInvoiceLineItem[];
  modifications: {
    date: string;
    veg_reduction: number;
    nonveg_reduction: number;
    credit: number;
  }[];
  subtotal: number;
  total_reduction: number;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: CorporateInvoiceStatus;
  paid_at?: string;
  due_date?: string;
  created_at: string;
}
