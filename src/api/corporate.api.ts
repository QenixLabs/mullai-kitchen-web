import { apiClient } from './client';
import { CORPORATE_ROUTES } from './routes';
import type {
  ICreateCorporateOrderRequest,
  IModifyCorporateOrderRequest,
  ICorporateOrder,
  ICorporateOrderModification,
  ICorporateInvoice,
} from './types/corporate.types';

export const corporateApi = {
  createOrder: (payload: ICreateCorporateOrderRequest) =>
    apiClient.post<ICorporateOrder>(CORPORATE_ROUTES.ORDERS, payload).then((r) => r.data),

  getOrders: () =>
    apiClient.get<ICorporateOrder[]>(CORPORATE_ROUTES.ORDERS).then((r) => r.data),

  getOrderById: (id: string) =>
    apiClient.get<ICorporateOrder>(CORPORATE_ROUTES.ORDER(id)).then((r) => r.data),

  modifyOrder: (id: string, payload: IModifyCorporateOrderRequest) =>
    apiClient.post<ICorporateOrder>(CORPORATE_ROUTES.MODIFY_ORDER(id), payload).then((r) => r.data),

  getModifications: (id: string) =>
    apiClient.get<ICorporateOrderModification[]>(CORPORATE_ROUTES.MODIFICATIONS(id)).then((r) => r.data),

  getInvoice: (id: string, type: string) =>
    apiClient.get<ICorporateInvoice>(CORPORATE_ROUTES.INVOICE(id, type)).then((r) => r.data),

  cancelOrder: (id: string, payload: { reason?: string }) =>
    apiClient.post<ICorporateOrder>(CORPORATE_ROUTES.CANCEL_ORDER(id), payload).then((r) => r.data),

  generateFinalInvoice: (id: string) =>
    apiClient.post<ICorporateInvoice>(CORPORATE_ROUTES.GENERATE_FINAL_INVOICE(id)).then((r) => r.data),
};
