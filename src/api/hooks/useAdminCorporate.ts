"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminCorporateApi,
  type AdminCorporateOrderListParams,
  type AdminCorporateInvoiceListParams,
  type AdminCorporateDailyOrderListParams,
  type AdminCorporateCompanyListParams,
  type PaginationParams,
  type CancelCorporateOrderPayload,
  type UpdateCorporateOrderStatusPayload,
  type MarkInvoicePaidPayload,
} from "@/api/admin-corporate.api";
import { adminCorporateKeys } from "@/api/query-keys";

export function useAdminCorporateOrders(params?: AdminCorporateOrderListParams) {
  return useQuery({
    queryKey: adminCorporateKeys.list(params),
    queryFn: () => adminCorporateApi.listOrders(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCorporateOrderDetail(id: string | null) {
  return useQuery({
    queryKey: adminCorporateKeys.detail(id!),
    queryFn: () => adminCorporateApi.getDetail(id!),
    enabled: !!id,
  });
}

export function useAdminCorporateOrderModifications(id: string | null) {
  return useQuery({
    queryKey: adminCorporateKeys.modifications(id!),
    queryFn: () => adminCorporateApi.getModifications(id!),
    enabled: !!id,
  });
}

export function useAdminCorporateOrderInvoices(id: string | null) {
  return useQuery({
    queryKey: adminCorporateKeys.invoices(id!),
    queryFn: () => adminCorporateApi.getInvoices(id!),
    enabled: !!id,
  });
}

export function useAdminCorporateOrderDailyOrders(
  id: string | null,
  params?: AdminCorporateDailyOrderListParams
) {
  return useQuery({
    queryKey: adminCorporateKeys.dailyOrders(id!, params),
    queryFn: () => adminCorporateApi.getDailyOrders(id!, params),
    enabled: !!id,
  });
}

export function useCancelCorporateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelCorporateOrderPayload }) =>
      adminCorporateApi.cancelOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.detail(variables.id) });
      toast.success("Corporate order cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel corporate order");
    },
  });
}

export function useUpdateCorporateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCorporateOrderStatusPayload }) =>
      adminCorporateApi.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.detail(variables.id) });
      toast.success("Order status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update order status");
    },
  });
}

export function useAdminCorporateInvoices(params?: AdminCorporateInvoiceListParams) {
  return useQuery({
    queryKey: adminCorporateKeys.invoiceList(params),
    queryFn: () => adminCorporateApi.listInvoices(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkInvoicePaidPayload }) =>
      adminCorporateApi.markInvoicePaid(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.invoiceLists() });
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.invoiceList() });
      queryClient.invalidateQueries({ queryKey: adminCorporateKeys.invoices(variables.id) });
      toast.success("Invoice marked as paid");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to mark invoice as paid");
    },
  });
}

export function useAdminCorporateDailyOrders(params?: AdminCorporateDailyOrderListParams) {
  return useQuery({
    queryKey: adminCorporateKeys.dailyOrderList(params),
    queryFn: () => adminCorporateApi.listDailyOrders(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCorporateDailyOrdersSummary(params?: { outlet_id?: string; date?: string }) {
  return useQuery({
    queryKey: adminCorporateKeys.dailyOrderSummary(params),
    queryFn: () => adminCorporateApi.getDailyOrdersSummary(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCorporateCompanies(params?: AdminCorporateCompanyListParams) {
  return useQuery({
    queryKey: adminCorporateKeys.companyList(params),
    queryFn: () => adminCorporateApi.listCompanies(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCorporateCompanyDetail(id: string | null) {
  return useQuery({
    queryKey: adminCorporateKeys.companyDetail(id!),
    queryFn: () => adminCorporateApi.getCompanyDetail(id!),
    enabled: !!id,
  });
}

export function useAdminCorporateCompanyOrders(
  id: string | null,
  params?: PaginationParams
) {
  return useQuery({
    queryKey: adminCorporateKeys.companyOrders(id!, params),
    queryFn: () => adminCorporateApi.getCompanyOrders(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCorporateCompanyInvoices(
  id: string | null,
  params?: PaginationParams
) {
  return useQuery({
    queryKey: adminCorporateKeys.companyInvoices(id!, params),
    queryFn: () => adminCorporateApi.getCompanyInvoices(id!, params),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
