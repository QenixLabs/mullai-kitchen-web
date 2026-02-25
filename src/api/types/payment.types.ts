// ===========================================
// Payment Types
// ===========================================

export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "cancelled";

export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionCategory =
  | "PAUSE_CREDIT"
  | "SUBSCRIPTION_PURCHASE"
  | "ADDON_PURCHASE"
  | "WALLET_TOPUP"
  | "RESERVATION_CONFIRMED"
  | "SUBSCRIPTION_CANCELLATION";
export type ReferenceType = "SUBSCRIPTION" | "ADDON_ORDER";

export type WalletReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RELEASED"
  | "EXPIRED";
export type InvoiceStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

// ===========================================
// Payment Order Types
// ===========================================

export interface CreatePaymentOrderRequest {
  plan_id: string;
  address_id: string;
  start_date: string;
  apply_wallet?: boolean;
}

export interface PaymentOrderResponse {
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  walletReservationAmount: number;
}

// ===========================================
// Razorpay Handler Types
// ===========================================

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ===========================================
// Order Status Types
// ===========================================

export interface OrderStatusResponse {
  orderId: string;
  status: "created" | "attempted" | "paid" | "failed";
  amount: number;
  currency: string;
  attempts: number;
  createdAt: string;
}

export interface ReservationStatusResponse {
  reservationId: string;
  status: WalletReservationStatus;
  amount: number;
  createdAt: string;
  expiresAt: string;
}

// ===========================================
// Wallet Types
// ===========================================

export interface Wallet {
  _id: string;
  customer_id: string;
  balance: number;
  currency: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WalletBalanceResponse {
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  _id: string;
  wallet_id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id: string;
  reference_type: ReferenceType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WalletReservation {
  _id: string;
  wallet_id: string;
  amount: number;
  reference_type: ReferenceType;
  reference_id: string;
  razorpay_order_id: string;
  status: WalletReservationStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ===========================================
// Invoice Types
// ===========================================

export interface Invoice {
  _id: string;
  subscription_id: string;
  invoice_number: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: string;
  invoice_date: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

// ===========================================
// Checkout Preview Types
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
  outlet?: {
    _id: string;
    name: string;
    delivery_charge: number;
  };
  pricing: {
    subtotal: number;
    delivery_charge: number;
    taxes?: number;
    total: number;
  };
  wallet_balance?: number;
  wallet_reservation_amount?: number;
  amount_after_wallet?: number;
  start_date: string;
}
