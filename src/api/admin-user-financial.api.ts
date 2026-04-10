import { apiClient } from '@/api/client';
import { ADMIN_ROUTES } from '@/api/routes';

// Invoice statuses
export type IndividualInvoiceStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type CorporateInvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type SubscriptionStatus = 'active' | 'paused' | 'expired' | 'cancelled';
export type CorporateInvoiceType = 'proforma' | 'cycle';
export type CorporatePaymentStatus = 'pending' | 'paid' | 'overdue';

// Individual Invoice (customer)
export interface AdminIndividualInvoice {
  _id: string;
  invoice_number: string;
  subscription_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: IndividualInvoiceStatus;
  due_date: string;
  paid_at?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
}

// Corporate Invoice
export interface AdminCorporateInvoice {
  _id: string;
  invoice_number: string;
  corporate_order_id: string;
  corporate_id: string;
  company_name: string;
  type: CorporateInvoiceType;
  cycle_number?: number;
  billing_period_start?: string;
  billing_period_end?: string;
  subtotal: number;
  total_modification: number;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: CorporateInvoiceStatus;
  paid_at?: string;
  due_date?: string;
  payment_reference?: string;
  created_at: string;
}

// Union type
export type AdminInvoice = AdminIndividualInvoice | AdminCorporateInvoice;

// Subscription
export interface AdminSubscription {
  _id: string;
  plan_id: string;
  plan_name: string;
  user_id: string;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  total_deliveries: number;
  completed_deliveries: number;
  remaining_deliveries: number;
  auto_renew: boolean;
  total_amount: number;
  outlet_id: string;
  outlet_name: string;
  created_at: string;
  address?: string;
  full_address?: string;
}

// Corporate Order
export type CorporateOrderStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface AdminCorporateOrder {
  _id: string;
  order_id: string;
  corporate_id: string;
  company_name: string;
  status: CorporateOrderStatus;
  start_date: string;
  end_date: string;
  headcount: number;
  veg_count: number;
  nonveg_count: number;
  proforma_amount: number;
  total_modification_amount: number;
  final_amount: number;
  payment_status: CorporatePaymentStatus;
  outlet_name: string;
  created_at: string;
}

// List responses
export interface AdminInvoiceListResponse {
  invoices: AdminInvoice[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminSubscriptionListResponse {
  subscriptions: AdminSubscription[];
  total: number;
  page: number;
  totalPages: number;
}

export interface MarkInvoicePaidPayload {
  payment_reference?: string;
}

export const adminUserFinancialApi = {
  getUserInvoices: async (userId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<AdminInvoiceListResponse>(ADMIN_ROUTES.USER_INVOICES(userId), { params });
    return data;
  },

  getUserSubscriptions: async (userId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const { data } = await apiClient.get<AdminSubscriptionListResponse>(ADMIN_ROUTES.USER_SUBSCRIPTIONS(userId), { params });
    return data;
  },

  getCorporateOrders: async (userId: string) => {
    const { data } = await apiClient.get<AdminCorporateOrder[]>(ADMIN_ROUTES.USER_CORPORATE_ORDERS(userId));
    return data;
  },

  markInvoicePaid: async (userId: string, invoiceId: string, payload: MarkInvoicePaidPayload) => {
    const { data } = await apiClient.put<AdminInvoice>(ADMIN_ROUTES.USER_MARK_INVOICE_PAID(userId, invoiceId), payload);
    return data;
  },

  markCorporateOrderPaid: async (userId: string, orderId: string, payload: MarkInvoicePaidPayload) => {
    const { data } = await apiClient.put<AdminCorporateOrder>(ADMIN_ROUTES.USER_MARK_ORDER_PAID(userId, orderId), payload);
    return data;
  },
};
