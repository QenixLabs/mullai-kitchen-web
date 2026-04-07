// src/stores/orderDraftStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderDraftDeliveryAddress {
  addressLine: string;
  pincode: string;
  area: string;
  city: string;
  state: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderDraft {
  step: number;
  deliveryAddress: OrderDraftDeliveryAddress;
  selectedDays: string[];
  mealTypes: string[];
  startDate: string;
  endDate: string;
  billingCycleDays: number | undefined;
  headcount: number;
  vegCount: number;
  nonvegCount: number;
  notes: string;
}

export interface OrderDraftStore {
  draft: OrderDraft;
  setStep: (step: number) => void;
  updateDeliveryAddress: (address: Partial<OrderDraftDeliveryAddress>) => void;
  updateSchedule: (data: Partial<Pick<OrderDraft, 'selectedDays' | 'mealTypes' | 'startDate' | 'endDate' | 'billingCycleDays'>>) => void;
  updatePreferences: (data: Partial<Pick<OrderDraft, 'headcount' | 'vegCount' | 'nonvegCount' | 'notes'>>) => void;
  clearDraft: () => void;
}

const initialDraft: OrderDraft = {
  step: 1,
  deliveryAddress: {
    addressLine: '',
    pincode: '',
    area: '',
    city: '',
    state: '',
    landmark: '',
  },
  selectedDays: [],
  mealTypes: [],
  startDate: '',
  endDate: '',
  billingCycleDays: undefined,
  headcount: 0,
  vegCount: 0,
  nonvegCount: 0,
  notes: '',
};

export const useOrderDraftStore = create<OrderDraftStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      
      setStep: (step) => 
        set((state) => ({ draft: { ...state.draft, step } })),
      
      updateDeliveryAddress: (address) =>
        set((state) => ({
          draft: { 
            ...state.draft, 
            deliveryAddress: { ...state.draft.deliveryAddress, ...address } 
          },
        })),
      
      updateSchedule: (data) =>
        set((state) => ({ draft: { ...state.draft, ...data } })),
      
      updatePreferences: (data) =>
        set((state) => ({ draft: { ...state.draft, ...data } })),
      
      clearDraft: () => set({ draft: initialDraft }),
    }),
    { 
      name: 'mullai-order-draft',
      partialize: (state) => ({ draft: state.draft }),
    }
  )
);
