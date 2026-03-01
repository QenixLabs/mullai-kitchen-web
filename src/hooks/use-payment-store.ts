import { useEffect, useState, useMemo } from "react";

import { createPaymentStore, type PaymentStore } from "@/stores/payment-store";
import type { StoreApi } from "zustand/vanilla";

// Global store instance
let paymentStoreInstance: StoreApi<PaymentStore> | null = null;

const getPaymentStore = (): StoreApi<PaymentStore> => {
  if (!paymentStoreInstance) {
    paymentStoreInstance = createPaymentStore();
  }
  return paymentStoreInstance;
};

export function usePaymentStore<T = PaymentStore>(selector?: (state: PaymentStore) => T): T {
  const store = useMemo(() => getPaymentStore(), []);
  const [state, setState] = useState<T>(() => selector ? selector(store.getState()) : store.getState() as unknown as T);

  useEffect(() => {
    if (selector) {
      const unsubscribe = store.subscribe((newState: PaymentStore) => {
        const newSelected = selector(newState);
        setState(newSelected);
      });
      return unsubscribe;
    } else {
      const unsubscribe = store.subscribe((newState: PaymentStore) => {
        setState(newState as unknown as T);
      });
      return unsubscribe;
    }
  }, [store, selector]);

  return state;
}

// Helper to get store instance outside React components
export function getPaymentStoreInstance(): PaymentStore {
  return getPaymentStore().getState();
}
