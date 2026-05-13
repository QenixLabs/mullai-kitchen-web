import type {
  ICorporateOrder,
  ICorporateOrderModification,
  ICorporateInvoice,
  ICorporateDailyOrder,
} from './corporate.types';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface AdminCorporateOrderListParams extends PaginationParams {
  status?: string;
  payment_status?: string;
  outlet_id?: string;
  company_name?: string;
  search?: string;
}

export interface AdminCorporateOrderListResponse {
  data: ICorporateOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCorporateOrderDetailResponse {
  order: ICorporateOrder;
  modifications: ICorporateOrderModification[];
  invoices: ICorporateInvoice[];
}

export interface AdminCorporateModificationsResponse {
  data: ICorporateOrderModification[];
}

export interface AdminCorporateInvoicesResponse {
  data: ICorporateInvoice[];
}

export interface AdminCorporateInvoiceListParams extends PaginationParams {
  status?: string;
  type?: string;
  outlet_id?: string;
  company_name?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface AdminCorporateInvoiceListResponse {
  data: ICorporateInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCorporateDailyOrderListParams extends PaginationParams {
  date?: string;
  status?: string;
  outlet_id?: string;
  corporate_order_id?: string;
}

export interface AdminCorporateDailyOrderListResponse {
  data: ICorporateDailyOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCorporateDailyOrderSummaryItem {
  outlet_id: string;
  outlet_name: string;
  date: string;
  total_orders: number;
  veg_meals: number;
  nonveg_meals: number;
  total_meals: number;
}

export interface AdminCorporateDailyOrderSummaryResponse {
  summaries: AdminCorporateDailyOrderSummaryItem[];
}

export interface AdminCorporateCompany {
  _id: string;
  user_id: string;
  company_name: string;
  gst_number?: string;
  pan_number?: string;
  delegate: {
    name: string;
    designation: string;
    phone?: string;
    email?: string;
  };
  billing_address: {
    street_address: string;
    city: string;
    pincode: string;
    area_landmark: string;
    state_country: string;
  };
  active_orders_count: number;
  total_orders_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCorporateCompanyListParams extends PaginationParams {
  search?: string;
}

export interface AdminCorporateCompanyListResponse {
  data: AdminCorporateCompany[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCorporateCompanyOrdersResponse {
  orders: ICorporateOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCorporateCompanyInvoicesResponse {
  invoices: ICorporateInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CancelCorporateOrderPayload {
  reason?: string;
}

export interface UpdateCorporateOrderStatusPayload {
  status: string;
}

export interface MarkInvoicePaidPayload {
  payment_reference?: string;
  paid_at?: string;
}
