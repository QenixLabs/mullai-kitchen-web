export type PaymentMethod = "wallet" | "card" | "upi";

export const PAYMENT_METHODS = {
  WALLET: "wallet",
  CARD: "card",
  UPI: "upi",
} as const satisfies Record<string, PaymentMethod>;

export const CHECKOUT_CONFIG = {
  companyName: "MullaiKitchen",
  email: "support@mullaikitchen.com",
  supportEmailSubject: "Checkout Support",
  minDaysFromToday: 1,
} as const;

export interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
}

export interface AddressCardProps {
  address: {
    _id: string;
    type: string;
    full_address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
  };
  selected: boolean;
  onClick: () => void;
}

export interface PaymentOptionProps {
  id: PaymentMethod;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface PricingBreakdown {
  subtotal: number;
  optOutDiscount: number;
  discountedSubtotal: number;
  deliveryCharge: number;
  taxes: number;
  total: number;
  amountAfterWallet: number;
  walletReservation: number;
  perDayPrice: number;
  subscriptionDays: number;
  maxOptOutDays: number;
}

export interface CheckoutState {
  selectedAddressId: string | null;
  selectedPayment: PaymentMethod;
  applyWallet: boolean;
  startDate: Date;
  optOutDates: Date[];
  showAddressDialog: boolean;
  showWalletInfo: boolean;
  showOptOutDialog: boolean;
}
