import { apiClient } from "@/api/client";
import { PAYMENT_ROUTES } from "@/api/routes";
import type {
  CreatePaymentOrderRequest,
  OrderStatusResponse,
  PaymentOrderResponse,
  ReservationStatusResponse,
  TopupWalletRequest,
  TopupWalletResponse,
  WalletBalanceResponse,
  WalletTransaction,
} from "@/api/types/payment.types";

export const paymentApi = {
  /**
   * Creates a payment order with wallet reservation
   */
  createOrder: async (payload: CreatePaymentOrderRequest): Promise<PaymentOrderResponse> => {
    const response = await apiClient.post<PaymentOrderResponse>(
      PAYMENT_ROUTES.CREATE_ORDER,
      payload,
    );
    return response.data;
  },

  /**
   * Checks the status of a Razorpay order
   */
  getOrderStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    const response = await apiClient.get<OrderStatusResponse>(
      PAYMENT_ROUTES.ORDER_STATUS(orderId),
    );
    return response.data;
  },

  /**
   * Checks the status of a wallet reservation
   */
  getReservationStatus: async (reservationId: string): Promise<ReservationStatusResponse> => {
    const response = await apiClient.get<ReservationStatusResponse>(
      PAYMENT_ROUTES.RESERVATION_STATUS(reservationId),
    );
    return response.data;
  },

  /**
   * Gets the user's current wallet balance
   */
  getWalletBalance: async (): Promise<WalletBalanceResponse> => {
    const response = await apiClient.get<WalletBalanceResponse>(
      PAYMENT_ROUTES.WALLET_BALANCE,
    );
    return response.data;
  },

  /**
   * Gets the user's transaction history
   */
  getWalletTransactions: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: WalletTransaction[]; total: number }> => {
    const response = await apiClient.get<{ transactions: WalletTransaction[]; total: number }>(
      PAYMENT_ROUTES.WALLET_TRANSACTIONS,
      { params },
    );
    return response.data;
  },

  /**
   * Creates a Razorpay order for wallet top-up
   */
  topupWallet: async (payload: TopupWalletRequest): Promise<TopupWalletResponse> => {
    const response = await apiClient.post<TopupWalletResponse>(
      PAYMENT_ROUTES.WALLET_TOPUP,
      payload,
    );
    return response.data;
  },
};
