import { apiClient } from './client';
import { CORPORATE_ROUTES } from './routes';
import type {
  ICreateCorporateOrderRequest,
  ICreateCorporateOrderResponse,
  IModifyCorporateOrderRequest,
  ICorporateDailyOrder,
  ICorporateOrder,
  ICorporateOrderModification,
  ICorporateInvoice,
} from './types/corporate.types';

export const corporateApi = {
  createOrder: (payload: ICreateCorporateOrderRequest) =>
    apiClient.post<ICreateCorporateOrderResponse>(CORPORATE_ROUTES.ORDERS, payload).then((r) => r.data),

  getOrders: () =>
    apiClient.get<ICorporateOrder[]>(CORPORATE_ROUTES.ORDERS).then((r) => r.data),

  getOrderById: (id: string) =>
    apiClient.get<{ order: ICorporateOrder; modifications: unknown[] }>(CORPORATE_ROUTES.ORDER(id)).then((r) => r.data.order),

  modifyOrder: (id: string, payload: IModifyCorporateOrderRequest) =>
    apiClient.post<ICorporateOrder>(CORPORATE_ROUTES.MODIFY_ORDER(id), payload).then((r) => r.data),

  getModifications: (id: string) =>
    apiClient.get<{ modifications: ICorporateOrderModification[] }>(CORPORATE_ROUTES.MODIFICATIONS(id)).then((r) => r.data.modifications),

  getInvoice: (id: string, type: string) =>
    apiClient.get<{ invoice: ICorporateInvoice }>(CORPORATE_ROUTES.INVOICE(id, type)).then((r) => r.data.invoice),

  cancelOrder: (id: string, payload: { reason?: string }) =>
    apiClient.post<ICorporateOrder>(CORPORATE_ROUTES.CANCEL_ORDER(id), payload).then((r) => r.data),

  generateFinalInvoice: (id: string) =>
    apiClient.post<ICorporateInvoice>(CORPORATE_ROUTES.GENERATE_FINAL_INVOICE(id)).then((r) => r.data),

  getDailyOrders: (id: string, params?: Record<string, string>) =>
    apiClient.get<{ items: ICorporateDailyOrder[]; total: number; page: number; limit: number }>(
      CORPORATE_ROUTES.DAILY_ORDERS(id),
      { params },
    ).then((r) => r.data),

  getUpcomingDeliveries: (id: string) =>
    apiClient.get<ICorporateDailyOrder[]>(CORPORATE_ROUTES.UPCOMING_DELIVERIES(id)).then((r) => r.data),
};
