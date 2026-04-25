import { apiClient } from '@/api/client';
import type {
  AdminCorporateOrderListParams,
  AdminCorporateOrderListResponse,
  AdminCorporateOrderDetailResponse,
  AdminCorporateModificationsResponse,
  AdminCorporateInvoicesResponse,
  AdminCorporateInvoiceListParams,
  AdminCorporateInvoiceListResponse,
  AdminCorporateDailyOrderListParams,
  AdminCorporateDailyOrderListResponse,
  AdminCorporateDailyOrderSummaryResponse,
  AdminCorporateCompanyListParams,
  AdminCorporateCompanyListResponse,
  AdminCorporateCompany,
  AdminCorporateCompanyOrdersResponse,
  AdminCorporateCompanyInvoicesResponse,
  PaginationParams,
  CancelCorporateOrderPayload,
  UpdateCorporateOrderStatusPayload,
  MarkInvoicePaidPayload,
} from '@/api/types/admin-corporate.types';
import type {
  ICorporateOrder,
  ICorporateInvoice,
} from '@/api/types/corporate.types';

export type {
  AdminCorporateOrderListParams,
  AdminCorporateInvoiceListParams,
  AdminCorporateDailyOrderListParams,
  AdminCorporateCompanyListParams,
  PaginationParams,
  CancelCorporateOrderPayload,
  UpdateCorporateOrderStatusPayload,
  MarkInvoicePaidPayload,
};

const BASE = '/admin/corporate';

export const adminCorporateApi = {
  listOrders: async (params?: AdminCorporateOrderListParams): Promise<AdminCorporateOrderListResponse> => {
    const response = await apiClient.get<AdminCorporateOrderListResponse>(`${BASE}/orders`, { params });
    return response.data;
  },

  getDetail: async (id: string): Promise<ICorporateOrder> => {
    const response = await apiClient.get<ICorporateOrder>(`${BASE}/orders/${id}`);
    return response.data;
  },

  getModifications: async (id: string): Promise<AdminCorporateModificationsResponse> => {
    const response = await apiClient.get<AdminCorporateModificationsResponse>(`${BASE}/orders/${id}/modifications`);
    return response.data;
  },

  getInvoices: async (id: string): Promise<AdminCorporateInvoicesResponse> => {
    const response = await apiClient.get<AdminCorporateInvoicesResponse>(`${BASE}/orders/${id}/invoices`);
    return response.data;
  },

  getDailyOrders: async (id: string, params?: AdminCorporateDailyOrderListParams): Promise<AdminCorporateDailyOrderListResponse> => {
    const response = await apiClient.get<AdminCorporateDailyOrderListResponse>(`${BASE}/orders/${id}/daily-orders`, { params });
    return response.data;
  },

  cancelOrder: async (id: string, data: CancelCorporateOrderPayload): Promise<{ order: ICorporateOrder; invoice: ICorporateInvoice }> => {
    const response = await apiClient.put<{ order: ICorporateOrder; invoice: ICorporateInvoice }>(`${BASE}/orders/${id}/cancel`, data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateCorporateOrderStatusPayload): Promise<ICorporateOrder> => {
    const response = await apiClient.put<ICorporateOrder>(`${BASE}/orders/${id}/status`, data);
    return response.data;
  },

  listInvoices: async (params?: AdminCorporateInvoiceListParams): Promise<AdminCorporateInvoiceListResponse> => {
    const response = await apiClient.get<AdminCorporateInvoiceListResponse>(`${BASE}/invoices`, { params });
    return response.data;
  },

  getInvoice: async (id: string): Promise<ICorporateInvoice> => {
    const response = await apiClient.get<ICorporateInvoice>(`${BASE}/invoices/${id}`);
    return response.data;
  },

  markInvoicePaid: async (id: string, data: MarkInvoicePaidPayload): Promise<ICorporateInvoice> => {
    const response = await apiClient.put<ICorporateInvoice>(`${BASE}/invoices/${id}/mark-paid`, data);
    return response.data;
  },

  listDailyOrders: async (params?: AdminCorporateDailyOrderListParams): Promise<AdminCorporateDailyOrderListResponse> => {
    const response = await apiClient.get<AdminCorporateDailyOrderListResponse>(`${BASE}/daily-orders`, { params });
    return response.data;
  },

  getDailyOrdersSummary: async (params?: { outlet_id?: string; date?: string }): Promise<AdminCorporateDailyOrderSummaryResponse> => {
    const response = await apiClient.get<AdminCorporateDailyOrderSummaryResponse>(`${BASE}/daily-orders/summary`, { params });
    return response.data;
  },

  listCompanies: async (params?: AdminCorporateCompanyListParams): Promise<AdminCorporateCompanyListResponse> => {
    const response = await apiClient.get<AdminCorporateCompanyListResponse>(`${BASE}/companies`, { params });
    return response.data;
  },

  getCompanyDetail: async (id: string): Promise<AdminCorporateCompany> => {
    const response = await apiClient.get<AdminCorporateCompany>(`${BASE}/companies/${id}`);
    return response.data;
  },

  getCompanyOrders: async (id: string, params?: PaginationParams): Promise<AdminCorporateCompanyOrdersResponse> => {
    const response = await apiClient.get<AdminCorporateCompanyOrdersResponse>(`${BASE}/companies/${id}/orders`, { params });
    return response.data;
  },

  getCompanyInvoices: async (id: string, params?: PaginationParams): Promise<AdminCorporateCompanyInvoicesResponse> => {
    const response = await apiClient.get<AdminCorporateCompanyInvoicesResponse>(`${BASE}/companies/${id}/invoices`, { params });
    return response.data;
  },
};
