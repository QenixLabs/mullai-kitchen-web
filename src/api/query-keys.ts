export const authKeys = {
  all: () => ["auth"] as const,
  me: () => ["auth", "me"] as const,
};

export const customerKeys = {
  all: () => ["customer"] as const,
  plans: (params?: unknown) => ["customer", "plans", params] as const,
  menuPreview: (planId: string) => ["customer", "menu-preview", planId] as const,
  serviceability: () => ["customer", "serviceability"] as const,
  checkoutPreview: () => ["customer", "checkout-preview"] as const,
  customPlans: (params?: unknown) => ["customer", "custom-plans", params] as const,
  customPlan: (planId: string) => ["customer", "custom-plan", planId] as const,
  customPlanPricing: (params: unknown) => ["customer", "custom-plan-pricing", params] as const,
  customPlanMenuPreview: (params: unknown) => ["customer", "custom-plan-menu-preview", params] as const,
};

export const addressKeys = {
  all: () => ["customer", "addresses"] as const,
  lists: () => ["customer", "addresses", "list"] as const,
};

export const profileKeys = {
  profile: () => ["customer", "profile"] as const,
};

export const paymentKeys = {
  all: () => ["payment"] as const,
  wallet: () => ["payment", "wallet"] as const,
  walletBalance: () => ["payment", "wallet", "balance"] as const,
  walletTransactions: (params?: { limit?: number; offset?: number }) =>
    ["payment", "wallet", "transactions", params] as const,
  orderStatus: (orderId: string) => ["payment", "orders", "status", orderId] as const,
  reservationStatus: (reservationId: string) => ["payment", "reservations", "status", reservationId] as const,
  topup: () => ["payment", "topup"] as const,
};

export const subscriptionKeys = {
  all: () => ["subscription"] as const,
  subscriptions: (params?: { status?: string; page?: number; limit?: number }) =>
    ["subscription", "list", params] as const,
  subscription: (id: string) => ["subscription", id] as const,
  dailyOrders: (id: string, params?: { page?: number; limit?: number; status?: string }) =>
    ["subscription", id, "daily-orders", params] as const,
  pausePeriods: (id: string) => ["subscription", id, "pause-periods"] as const,
  optOutPeriods: (id: string, params?: { status?: string; page?: number; limit?: number }) =>
    ["subscription", id, "opt-out-periods", params] as const,
};

export const couponKeys = {
  all: () => ["coupon"] as const,
  available: (params?: { order_type?: string; order_amount?: number }) =>
    ["coupon", "available", params] as const,
  validation: (code: string) => ["coupon", "validation", code] as const,
};

export const corporateKeys = {
  all: ['corporate'] as const,
  orders: () => [...corporateKeys.all, 'orders'] as const,
  order: (id: string) => [...corporateKeys.all, 'order', id] as const,
  modifications: (orderId: string) => [...corporateKeys.all, 'modifications', orderId] as const,
  invoice: (orderId: string, type: string) => [...corporateKeys.all, 'invoice', orderId, type] as const,
};
