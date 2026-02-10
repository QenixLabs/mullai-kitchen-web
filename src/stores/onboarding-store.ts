import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import type {
  CreateAddressDto,
  UpdateProfileDto,
} from "@/api/types/customer.types";

export interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;

  addresses: CreateAddressDto[];
  defaultAddressIndex: number;

  profileDetails: UpdateProfileDto | null;

  nextStep: () => void;
  prevStep: () => void;
  skipOptionalStep: () => void;
  addAddress: (address: CreateAddressDto) => void;
  removeAddress: (index: number) => void;
  setDefaultAddress: (index: number) => void;
  setProfileDetails: (details: UpdateProfileDto | null) => void;
  completeOnboarding: () => void;
  reset: () => void;
  canProceed: () => boolean;
}

const defaultOnboardingState: Pick<
  OnboardingState,
  "currentStep" | "isCompleted" | "addresses" | "defaultAddressIndex" | "profileDetails"
> = {
  currentStep: 0,
  isCompleted: false,
  addresses: [],
  defaultAddressIndex: 0,
  profileDetails: null,
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

export const createOnboardingStore = (
  initialState: Partial<OnboardingState> = {},
) => {
  return createStore<OnboardingState>()(
    persist(
      (set, get) => ({
        ...defaultOnboardingState,
        ...initialState,
        nextStep: () => {
          set((state) => ({
            currentStep: Math.min(state.currentStep + 1, 3),
          }));
        },
        prevStep: () => {
          set((state) => ({
            currentStep: Math.max(state.currentStep - 1, 0),
          }));
        },
        skipOptionalStep: () => {
          set((state) => ({
            currentStep: state.currentStep === 2 ? 3 : state.currentStep,
          }));
        },
        addAddress: (address: CreateAddressDto) => {
          set((state) => {
            const addresses = [...state.addresses, address];
            const defaultAddressIndex =
              state.addresses.length === 0 ? 0 : state.defaultAddressIndex;

            return { addresses, defaultAddressIndex };
          });
        },
        removeAddress: (index: number) => {
          set((state) => {
            if (index < 0 || index >= state.addresses.length) {
              return {};
            }

            const addresses = state.addresses.filter(
              (_, addressIndex) => addressIndex !== index,
            );

            let defaultAddressIndex = state.defaultAddressIndex;
            if (addresses.length === 0) {
              defaultAddressIndex = 0;
            } else if (index === state.defaultAddressIndex) {
              defaultAddressIndex = 0;
            } else if (index < state.defaultAddressIndex) {
              defaultAddressIndex = state.defaultAddressIndex - 1;
            }

            return { addresses, defaultAddressIndex };
          });
        },
        setDefaultAddress: (index: number) => {
          set((state) => {
            if (index < 0 || index >= state.addresses.length) {
              return {};
            }

            return { defaultAddressIndex: index };
          });
        },
        setProfileDetails: (details: UpdateProfileDto | null) => {
          set({ profileDetails: details });
        },
        completeOnboarding: () => {
          set({ isCompleted: true, currentStep: 3 });
        },
        reset: () => {
          set({ ...defaultOnboardingState });
        },
        canProceed: () => {
          return get().addresses.length > 0;
        },
      }),
      {
        name: "mk-onboarding-store",
        storage: createJSONStorage(getSessionStorage),
        partialize: (state) => ({
          currentStep: state.currentStep,
          isCompleted: state.isCompleted,
          addresses: state.addresses,
          defaultAddressIndex: state.defaultAddressIndex,
          profileDetails: state.profileDetails,
        }),
      },
    ),
  );
};
