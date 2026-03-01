import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/api/payment.api";
import { paymentKeys } from "@/api/query-keys";
import type {
  CreatePaymentOrderRequest,
  WalletBalanceResponse,
  WalletTransaction,
  OrderStatusResponse,
  PaymentOrderResponse,
  ReservationStatusResponse,
  TopupWalletRequest,
  TopupWalletResponse,
} from "@/api/types/payment.types";

export function useWalletBalance() {
  return useQuery<WalletBalanceResponse>({
    queryKey: paymentKeys.walletBalance(),
    queryFn: paymentApi.getWalletBalance,
    staleTime: 60_000, // 1 minute
  });
}

export function useWalletTransactions(params?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery<{ transactions: WalletTransaction[]; total: number }>({
    queryKey: paymentKeys.walletTransactions(params),
    queryFn: () => paymentApi.getWalletTransactions(params),
    staleTime: 60_000,
  });
}

export function useOrderStatus(orderId: string) {
  return useQuery<OrderStatusResponse>({
    queryKey: paymentKeys.orderStatus(orderId),
    queryFn: () => paymentApi.getOrderStatus(orderId),
    enabled: !!orderId,
    staleTime: 30_000, // 30 seconds - status may change
  });
}

export function useReservationStatus(reservationId: string) {
  return useQuery<ReservationStatusResponse>({
    queryKey: paymentKeys.reservationStatus(reservationId),
    queryFn: () => paymentApi.getReservationStatus(reservationId),
    enabled: !!reservationId,
    staleTime: 30_000, // 30 seconds - status may change
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<PaymentOrderResponse, Error, CreatePaymentOrderRequest>({
    mutationFn: paymentApi.createOrder,
    onSuccess: (data) => {
      // Invalidate wallet balance on successful order creation
      queryClient.invalidateQueries({ queryKey: paymentKeys.walletBalance() });
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
    },
  });
}

export function useTopupWallet() {
  const queryClient = useQueryClient();

  return useMutation<TopupWalletResponse, Error, TopupWalletRequest>({
    mutationFn: paymentApi.topupWallet,
    onSuccess: (data) => {
      // Invalidate wallet balance to reflect new amount
      queryClient.invalidateQueries({ queryKey: paymentKeys.walletBalance() });
      // Invalidate transactions to show new top-up entry
      queryClient.invalidateQueries({ queryKey: paymentKeys.walletTransactions() });
    },
    onError: (error) => {
      console.error("Top-up failed:", error);
    },
  });
}
