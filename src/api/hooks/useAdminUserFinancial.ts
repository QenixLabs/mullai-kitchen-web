"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminUserFinancialApi, type MarkInvoicePaidPayload } from "@/api/admin-user-financial.api";
import { adminUserFinancialKeys } from "@/api/query-keys";

export function useUserInvoices(userId: string, params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminUserFinancialKeys.invoices(userId, params),
    queryFn: () => adminUserFinancialApi.getUserInvoices(userId, params),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useUserSubscriptions(userId: string, params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: adminUserFinancialKeys.subscriptions(userId, params),
    queryFn: () => adminUserFinancialApi.getUserSubscriptions(userId, params),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCorporateOrders(userId: string) {
  return useQuery({
    queryKey: adminUserFinancialKeys.corporateOrders(userId),
    queryFn: () => adminUserFinancialApi.getCorporateOrders(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMarkInvoicePaid(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: MarkInvoicePaidPayload }) =>
      adminUserFinancialApi.markInvoicePaid(userId, invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserFinancialKeys.invoices(userId) });
      queryClient.invalidateQueries({ queryKey: adminUserFinancialKeys.corporateOrders(userId) });
      queryClient.invalidateQueries({ queryKey: adminUserFinancialKeys.subscriptions(userId) });
      toast.success("Invoice marked as paid successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to mark invoice as paid");
    },
  });
}

export function useMarkCorporateOrderPaid(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: MarkInvoicePaidPayload }) =>
      adminUserFinancialApi.markCorporateOrderPaid(userId, orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserFinancialKeys.corporateOrders(userId) });
      queryClient.invalidateQueries({ queryKey: adminUserFinancialKeys.invoices(userId) });
      toast.success("Order payment marked as paid successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to mark order payment as paid");
    },
  });
}
