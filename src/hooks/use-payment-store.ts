import { useEffect, useMemo, useState } from "react";

import { createPaymentStore, type PaymentStore } from "@/stores/payment-store";

// Global store instance
let paymentStoreInstance: ReturnType<typeof createPaymentStore> | null = null;

const getPaymentStore = (): PaymentStore => {
  if (!paymentStoreInstance) {
    paymentStoreInstance = createPaymentStore();
  }
  return paymentStoreInstance;
};

export function usePaymentStore<T = PaymentStore>(selector?: (state: PaymentStore) => T): T {
  const store = useMemo(getPaymentStore, []);

  // No selector provided - return full store with subscription
  if (!selector) {
    const [state, setState] = useState<PaymentStore>(store.getState());

    useEffect(() => {
      const unsubscribe = store.subscribe((newState) => {
        setState(newState);
      });
      return unsubscribe;
    }, [store]);

    return state as unknown as T;
  }

  // Selector provided - return selected slice
  const [state, setState] = useState<T>(selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      const newSelected = selector(newState);
      setState(newSelected);
    });
    return unsubscribe;
  }, [store, selector]);

  return state;
}

// Helper to get store instance outside React components
export function getPaymentStoreInstance(): PaymentStore {
  return getPaymentStore();
}
