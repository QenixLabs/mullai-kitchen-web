export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_RESET_OTP: "/auth/verify-reset-otp",
  RESET_PASSWORD: "/auth/reset-password",
  SEND_SIGNUP_OTP: "/auth/send-signup-otp",
  VERIFY_SIGNUP_OTP: "/auth/verify-signup-otp",
  CHANGE_PASSWORD: "/auth/change-password",
  CORPORATE_REGISTER: "/auth/corporate/register",
  PERMISSIONS: "/auth/permissions",
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
  PREVIEW_PRICING: "/payment/preview-pricing",
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
  OPT_OUT_PERIODS: (id: string) => `/customer/subscriptions/${id}/opt-out-periods`,
  OPT_OUT: (id: string) => `/customer/subscriptions/${id}/opt-out`,
  CANCEL_OPT_OUT: (id: string, optOutId: string) => `/customer/subscriptions/${id}/opt-out/${optOutId}`,
} as const;

export const COUPON_ROUTES = {
  VALIDATE: "/coupons/validate",
  LIST: "/coupons",
} as const;

export const CORPORATE_ROUTES = {
  ORDERS: "/corporate/orders",
  ORDER: (id: string) => `/corporate/orders/${id}`,
  MODIFY_ORDER: (id: string) => `/corporate/orders/${id}/modify`,
  MODIFICATIONS: (id: string) => `/corporate/orders/${id}/modifications`,
  INVOICE: (id: string, type: string) => `/corporate/orders/${id}/invoice/${type}`,
  ALL_INVOICES: (id: string) => `/corporate/orders/${id}/invoices/all`,
  CANCEL_ORDER: (id: string) => `/corporate/orders/${id}/cancel`,
  UPDATE_PAYMENT: (id: string) => `/corporate/orders/${id}/payment`,
  PROFILE: "/corporate/profile",
  DELIVERY_ADDRESSES: "/corporate/profile/delivery-addresses",
  DELIVERY_ADDRESS: (index: number) => `/corporate/profile/delivery-addresses/${index}`,
  DAILY_ORDERS: (id: string) => `/corporate/orders/${id}/daily-orders`,
  UPCOMING_DELIVERIES: (id: string) => `/corporate/orders/${id}/upcoming-deliveries`,
  ORDER_PRICING: '/corporate/orders/pricing',
} as const;

export const ADD_ON_ROUTES = {
  // Independent endpoints (no subscription ID required)
  AVAILABLE_INDEPENDENT: '/customer/subscriptions/addons/available',
  MEAL_TYPES: '/customer/subscriptions/addons/meal-types',
  ORDER_HISTORY: '/customer/subscriptions/addons/orders',
  PREPARE_CHECKOUT_INDEPENDENT: '/customer/subscriptions/addons/prepare-checkout',
  CREATE_ORDER_INDEPENDENT: '/customer/subscriptions/addons/create-order',
  // Legacy subscription-scoped endpoints (kept for backward compatibility)
  AVAILABLE: (id: string) => `/customer/subscriptions/${id}/add-ons/available`,
  CART_SUMMARY: (id: string) => `/customer/subscriptions/${id}/add-ons/cart-summary`,
  PREPARE_CHECKOUT: (id: string) => `/customer/subscriptions/${id}/add-ons/prepare-checkout`,
  CREATE_ORDER: (id: string) => `/customer/subscriptions/${id}/add-ons/create-order`,
  ACTIVE_ORDERS: (id: string) => `/customer/subscriptions/${id}/add-ons`,
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  USERS: '/admin/users',
  USER_DETAIL: (id: string) => `/admin/users/${id}`,
  CREATE_ADMIN: '/admin/users/admin',
  CREATE_HUB_OWNER: '/admin/users/hub-owner',
  CREATE_DELIVERY_PARTNER: '/admin/users/delivery-partner',
  USER_STATUS: (id: string) => `/admin/users/${id}/status`,
  USER_INVOICES: (id: string) => `/admin/users/${id}/invoices`,
  USER_SUBSCRIPTIONS: (id: string) => `/admin/users/${id}/subscriptions`,
  USER_CORPORATE_ORDERS: (id: string) => `/admin/users/${id}/corporate-orders`,
  USER_MARK_INVOICE_PAID: (userId: string, invoiceId: string) => `/admin/users/${userId}/invoices/${invoiceId}/mark-paid`,
  USER_MARK_ORDER_PAID: (userId: string, orderId: string) => `/admin/users/${userId}/corporate-orders/${orderId}/mark-paid`,
  RECIPES: '/admin/recipes',
  RECIPE_DETAIL: (id: string) => `/admin/recipes/${id}`,
  RECIPE_STATUS: (id: string) => `/admin/recipes/${id}/status`,
  RECIPE_SELECT: '/admin/recipes/select',
  OUTLET_TEMPLATES: (outletId: string) => `/admin/outlets/${outletId}/templates`,
  OUTLET_TEMPLATE_GRID: (outletId: string) => `/admin/outlets/${outletId}/templates/grid`,
  OUTLET_TEMPLATE_DETAIL: (outletId: string, id: string) => `/admin/outlets/${outletId}/templates/${id}`,
  OUTLET_TEMPLATE_TOGGLE: (outletId: string, id: string) => `/admin/outlets/${outletId}/templates/${id}/toggle-publish`,
  OUTLET_TEMPLATE_BULK_COPY: (outletId: string) => `/admin/outlets/${outletId}/templates/bulk-copy`,
  OUTLET_OVERRIDES: (outletId: string) => `/admin/outlets/${outletId}/overrides`,
  OUTLET_OVERRIDE_CALENDAR: (outletId: string) => `/admin/outlets/${outletId}/overrides/calendar`,
  OUTLET_OVERRIDE_DETAIL: (outletId: string, id: string) => `/admin/outlets/${outletId}/overrides/${id}`,
  PLANS: '/admin/plans',
  PLAN_DETAIL: (id: string) => `/admin/plans/${id}`,
  PLAN_STATUS: (id: string) => `/admin/plans/${id}/status`,
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_SUBSCRIPTION_DETAIL: (id: string) => `/admin/subscriptions/${id}`,
  ADMIN_SUBSCRIPTION_PAUSE: (id: string) => `/admin/subscriptions/${id}/pause`,
  ADMIN_SUBSCRIPTION_RESUME: (id: string) => `/admin/subscriptions/${id}/resume`,
  ADMIN_SUBSCRIPTION_SKIP_DATES: (id: string) => `/admin/subscriptions/${id}/skip-dates`,
  ADMIN_SUBSCRIPTION_ACTIVITY: (id: string) => `/admin/subscriptions/${id}/activity`,
} as const;
