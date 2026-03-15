import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import type {
  PaymentOrderResponse,
  PaymentStatus,
  PaymentSuccessResponse,
} from "@/api/types/payment.types";

export interface PaymentState {
  status: PaymentStatus;
  orderId: string | null;
  keyId: string | null;
  amount: number | null;
  currency: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paymentId: string | null;
  paymentSessionId: string | null;
  errorMessage: string | null;
  walletReservationAmount: number | null;
  providerAccountId: string | null;
  provider: 'razorpay' | 'zoho' | null;
}

export interface PaymentActions {
  setPaymentProcessing: (order: PaymentOrderResponse) => void;
  setPaymentSuccess: (response: PaymentSuccessResponse) => void;
  setPaymentFailed: (message: string) => void;
  setPaymentCancelled: () => void;
  resetPayment: () => void;
  setErrorMessage: (message: string) => void;
}

export type PaymentStore = PaymentState & PaymentActions;

const defaultPaymentState: PaymentState = {
  status: "idle",
  orderId: null,
  keyId: null,
  amount: null,
  currency: null,
  razorpayPaymentId: null,
  razorpaySignature: null,
  paymentId: null,
  paymentSessionId: null,
  errorMessage: null,
  walletReservationAmount: null,
  providerAccountId: null,
  provider: null,
};

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const getSessionStorage = (): StateStorage => {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  return window.sessionStorage;
};

export const createPaymentStore = (
  initialState: Partial<PaymentState> = {},
) => {
  return createStore<PaymentStore>()(
    persist(
      (set: (partial: Partial<PaymentStore>) => void) => ({
        ...defaultPaymentState,
        ...initialState,
        setPaymentProcessing: (order: PaymentOrderResponse) => {
          set({
            status: "processing",
            orderId: order.order_id,
            keyId: order.keyId,
            amount: order.amount,
            currency: order.currency,
            walletReservationAmount: order.walletReservationAmount,
            providerAccountId: order.providerAccountId || null,
            provider: order.provider || null,
            errorMessage: null,
          });
        },
        setPaymentSuccess: (response: PaymentSuccessResponse) => {
          // Handle Zoho response
          if ('payment_id' in response) {
            set({
              status: "success",
              paymentId: response.payment_id,
              paymentSessionId: response.payment_session_id,
              razorpayPaymentId: null,
              razorpaySignature: null,
              errorMessage: null,
            });
          } else {
            // Handle Razorpay response
            set({
              status: "success",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentId: null,
              paymentSessionId: null,
              errorMessage: null,
            });
          }
        },
        setPaymentFailed: (message: string) => {
          set({
            status: "failed",
            errorMessage: message,
          });
        },
        setPaymentCancelled: () => {
          set({
            status: "cancelled",
            errorMessage: null,
          });
        },
        resetPayment: () => {
          set(defaultPaymentState);
        },
        setErrorMessage: (message: string) => {
          set({ errorMessage: message });
        },
      }),
      {
        name: "mk-payment-store",
        storage: createJSONStorage(getSessionStorage),
        partialize: (state: PaymentStore) => ({
          // Intentionally omit `status` — transient states like "processing"
          // or "cancelled" must not survive a page reload or they permanently
          // disable the Pay button. Status always re-initialises to "idle".
          orderId: state.orderId,
          keyId: state.keyId,
          amount: state.amount,
          currency: state.currency,
          razorpayPaymentId: state.razorpayPaymentId,
          razorpaySignature: state.razorpaySignature,
          paymentId: state.paymentId,
          paymentSessionId: state.paymentSessionId,
          walletReservationAmount: state.walletReservationAmount,
          providerAccountId: state.providerAccountId,
          provider: state.provider,
        }),
      },
    ),
  );
};
