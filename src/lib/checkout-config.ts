export type PaymentMethod = "wallet" | "card" | "upi";

export const PAYMENT_METHODS = {
  WALLET: "wallet" as const,
  CARD: "card" as const,
  UPI: "upi" as const,
};

export const CHECKOUT_CONFIG = {
  companyName: "MullaiKitchen",
  email: "support@mullaikitchen.com",
  supportEmailSubject: "Checkout Support",
  minDaysFromToday: 1,
} as const;

export interface PricingBreakdown {
  subtotal: number;
  optOutDiscount: number;
  discountedSubtotal: number;
  couponDiscount: number;
  deliveryCharge: number;
  taxes: number;
  total: number;
  amountAfterWallet: number;
  walletReservation: number;
  perDayPrice: number;
  subscriptionDays: number;
  maxOptOutDays: number;
}
