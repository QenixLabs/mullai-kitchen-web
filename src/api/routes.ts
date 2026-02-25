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
