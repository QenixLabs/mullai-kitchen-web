export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
} as const;

export const USER_ROUTES = {
  ME: "/users/profile/me",
} as const;

export const CUSTOMER_ROUTES = {
  PLANS: "/customer/plans",
  MENU_PREVIEW: (planId: string) => `/customer/plans/${planId}/menu-preview`,
  SERVICEABILITY_CHECK: "/customer/serviceability/check",
  CHECKOUT_PREPARE: "/customer/checkout/prepare",
  CHECKOUT_CREATE_ORDER: "/customer/checkout/create-order",
  ADDRESSES: "/customer/addresses",
  PROFILE: "/customer/profile",
  CUSTOM_PLANS: "/customer/build-plan",
  CUSTOM_PLAN: (planId: string) => `/customer/build-plan/${planId}`,
  CUSTOM_PLAN_PRICING: "/customer/build-plan/pricing",
  CUSTOM_PLAN_MENU_PREVIEW: (
    preference: string,
    meals: string[],
    days: number,
  ) =>
    `/customer/build-plan/menu-preview?preference=${preference}&meal_types=${meals.join(",")}&days=${days}`,
} as const;

export const PAYMENT_ROUTES = {
  CREATE_ORDER: "/payment/create-order",
  WEBHOOK: "/payment/webhook",
  ORDER_STATUS: (orderId: string) => `/payment/orders/${orderId}/status`,
  RESERVATION_STATUS: (reservationId: string) => `/payment/reservations/${reservationId}/status`,
  WALLET_BALANCE: "/payment/wallet/balance",
  WALLET_TRANSACTIONS: "/payment/wallet/transactions",
  WALLET_TOPUP: "/payment/wallet/topup",
} as const;

export const SUBSCRIPTION_ROUTES = {
  SUBSCRIPTIONS: "/customer/subscriptions",
  SUBSCRIPTION: (id: string) => `/customer/subscriptions/${id}`,
  DAILY_ORDERS: (id: string) => `/customer/subscriptions/${id}/daily-orders`,
  PAUSE_PERIODS: (id: string) => `/customer/subscriptions/${id}/pause-periods`,
  PAUSE: (id: string) => `/customer/subscriptions/${id}/pause`,
  RESUME: (id: string) => `/customer/subscriptions/${id}/resume`,
  CANCEL: (id: string) => `/customer/subscriptions/${id}/cancel`,
  RENEW: (id: string) => `/customer/subscriptions/${id}/renew`,
  TOGGLE_AUTO_RENEW: (id: string) => `/customer/subscriptions/${id}/auto-renew`,
} as const;
