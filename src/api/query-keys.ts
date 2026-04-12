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
  allInvoices: (orderId: string) => [...corporateKeys.all, 'all-invoices', orderId] as const,
  dailyOrders: (orderId: string, params?: unknown) => [...corporateKeys.all, 'daily-orders', orderId, params] as const,
  upcomingDeliveries: (orderId: string) => [...corporateKeys.all, 'upcoming-deliveries', orderId] as const,
  orderPricing: (params: unknown) => [...corporateKeys.all, 'pricing', params] as const,
};

export const corporateProfileKeys = {
  all: ['corporate-profile'] as const,
  profile: () => [...corporateProfileKeys.all, 'profile'] as const,
};

export const permissionKeys = {
  all: () => ["permissions"] as const,
  available: () => ["permissions", "available"] as const,
  roles: () => ["permissions", "roles"] as const,
  auditLogs: (params?: { action?: string; userId?: string; limit?: number; offset?: number }) =>
    ["permissions", "audit", params] as const,
  userPermissions: (userId: string) => ["permissions", "user", userId] as const,
};

export const outletKeys = {
  all: ['admin', 'outlets'] as const,
  lists: () => [...outletKeys.all, 'list'] as const,
  list: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    [...outletKeys.lists(), params] as const,
  details: () => [...outletKeys.all, 'detail'] as const,
  detail: (id: string) => [...outletKeys.details(), id] as const,
};

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params?: { role?: string; status?: string; outlet_id?: string; search?: string; page?: number; limit?: number }) =>
    [...adminUserKeys.lists(), params] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
};

export const adminUserFinancialKeys = {
  all: ['admin-user-financial'] as const,
  invoices: (userId: string, params?: { status?: string; page?: number; limit?: number }) =>
    [...adminUserFinancialKeys.all, userId, 'invoices', params] as const,
  subscriptions: (userId: string, params?: { status?: string; page?: number; limit?: number }) =>
    [...adminUserFinancialKeys.all, userId, 'subscriptions', params] as const,
  corporateOrders: (userId: string) =>
    [...adminUserFinancialKeys.all, userId, 'corporate-orders'] as const,
};

export const recipeKeys = {
  all: ['admin', 'recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (params?: { status?: string; cuisine_type?: string; search?: string; page?: number; limit?: number }) =>
    [...recipeKeys.lists(), params] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  select: (outletId?: string) => [...recipeKeys.all, 'select', outletId] as const,
};

export const templateKeys = {
  all: (outletId: string) => ['admin', 'outlets', outletId, 'templates'] as const,
  lists: (outletId: string) => [...templateKeys.all(outletId), 'list'] as const,
  list: (outletId: string, params?: unknown) =>
    [...templateKeys.lists(outletId), params] as const,
  grid: (outletId: string, effectiveFrom?: string) =>
    [...templateKeys.all(outletId), 'grid', effectiveFrom] as const,
  detail: (outletId: string, id: string) =>
    [...templateKeys.all(outletId), 'detail', id] as const,
};

export const overrideKeys = {
  all: (outletId: string) => ['admin', 'outlets', outletId, 'overrides'] as const,
  lists: (outletId: string) => [...overrideKeys.all(outletId), 'list'] as const,
  list: (outletId: string, params?: unknown) =>
    [...overrideKeys.lists(outletId), params] as const,
  calendar: (outletId: string, dateFrom: string, dateUntil: string) =>
    [...overrideKeys.all(outletId), 'calendar', dateFrom, dateUntil] as const,
  detail: (outletId: string, id: string) =>
    [...overrideKeys.all(outletId), 'detail', id] as const,
};
