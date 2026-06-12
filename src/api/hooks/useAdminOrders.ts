"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminOrderApi, type AdminOrderListParams, type UpdateOrderStatusPayload, type BatchUpdateStatusPayload } from "@/api/admin-order.api";
import { adminOrderKeys } from "@/api/query-keys";

export function useAdminOrders(params?: AdminOrderListParams) {
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: () => adminOrderApi.list(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminOrderDetail(id: string | null) {
  return useQuery({
    queryKey: adminOrderKeys.detail(id!),
    queryFn: () => adminOrderApi.getDetail(id!),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusPayload }) =>
      adminOrderApi.updateStatus(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'outlets' && query.queryKey[3] === 'routes' });
      toast.success("Order status updated");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to update order status");
    },
  });
}

export function useBatchUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ routeId, data }: { routeId: string; data: BatchUpdateStatusPayload }) =>
      adminOrderApi.batchUpdateStatus(routeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.details() });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'admin' && query.queryKey[1] === 'outlets' && query.queryKey[3] === 'routes' });
      toast.success("Orders updated");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to batch update orders");
    },
  });
}
