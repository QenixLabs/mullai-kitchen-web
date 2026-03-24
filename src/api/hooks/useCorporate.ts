import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { corporateApi } from '@/api/corporate.api';
import { corporateKeys } from '@/api/query-keys';
import type { ICreateCorporateOrderRequest, IModifyCorporateOrderRequest } from '@/api/types/corporate.types';

export function useCreateCorporateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateCorporateOrderRequest) => corporateApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateKeys.orders() });
    },
  });
}

export function useCorporateOrders() {
  return useQuery({
    queryKey: corporateKeys.orders(),
    queryFn: () => corporateApi.getOrders(),
  });
}

export function useCorporateOrder(id: string) {
  return useQuery({
    queryKey: corporateKeys.order(id),
    queryFn: () => corporateApi.getOrderById(id),
    enabled: !!id,
  });
}

export function useModifyCorporateOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IModifyCorporateOrderRequest) =>
      corporateApi.modifyOrder(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: corporateKeys.modifications(orderId) });
    },
  });
}

export function useCorporateModifications(orderId: string) {
  return useQuery({
    queryKey: corporateKeys.modifications(orderId),
    queryFn: () => corporateApi.getModifications(orderId),
    enabled: !!orderId,
  });
}

export function useCorporateInvoice(orderId: string, type: string) {
  return useQuery({
    queryKey: corporateKeys.invoice(orderId, type),
    queryFn: () => corporateApi.getInvoice(orderId, type),
    enabled: !!orderId && !!type,
  });
}

export function useCancelCorporateOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason?: string }) =>
      corporateApi.cancelOrder(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: corporateKeys.orders() });
    },
  });
}

export function useGenerateFinalInvoice(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => corporateApi.generateFinalInvoice(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateKeys.order(orderId) });
      queryClient.invalidateQueries({ queryKey: corporateKeys.invoice(orderId, 'final') });
    },
  });
}
