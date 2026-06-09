import type { AdminOrderListParams } from '@/api/types/admin-order.types';
import type { CouponListParams } from '@/api/types/admin-coupon.types';
import type {
  AdminCorporateOrderListParams,
  AdminCorporateInvoiceListParams,
  AdminCorporateDailyOrderListParams,
  AdminCorporateCompanyListParams,
  PaginationParams,
} from '@/api/types/admin-corporate.types';
import type { IOperationsReportQuery, IFinancialReportQuery, IRevenueAnalyticsQuery } from '@/api/types/admin.types';

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

export const addOnKeys = {
  all: () => ['add-ons'] as const,
  // Independent keys (no subscription ID)
  availableIndependent: (params?: { delivery_date?: string }) =>
    [...addOnKeys.all(), 'available-independent', params] as const,
  mealTypes: () =>
    [...addOnKeys.all(), 'meal-types'] as const,
  orderHistory: (params?: { page?: number; limit?: number; status?: string }) =>
    [...addOnKeys.all(), 'order-history', params] as const,
  // Legacy subscription-scoped keys
  available: (subscriptionId: string, params?: { delivery_date?: string; meal_type?: string }) =>
    [...addOnKeys.all(), 'available', subscriptionId, params] as const,
  cartSummary: (subscriptionId: string) =>
    [...addOnKeys.all(), 'cart-summary', subscriptionId] as const,
  activeOrders: (subscriptionId: string) =>
    [...addOnKeys.all(), 'active-orders', subscriptionId] as const,
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

export const planKeys = {
  all: ['admin', 'plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (params?: { status?: string; plan_type?: string; duration?: string; outlet_id?: string; search?: string; page?: number; limit?: number }) =>
    [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
};

export const adminCouponKeys = {
  all: ['admin', 'coupons'] as const,
  lists: () => [...adminCouponKeys.all, 'list'] as const,
  list: (params?: CouponListParams) => [...adminCouponKeys.lists(), params] as const,
  details: () => [...adminCouponKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCouponKeys.details(), id] as const,
  stats: (id: string) => [...adminCouponKeys.all, 'stats', id] as const,
};

export const adminSubscriptionKeys = {
  all: ['admin', 'subscriptions'] as const,
  lists: () => [...adminSubscriptionKeys.all, 'list'] as const,
  list: (params?: { outlet_id?: string; status?: string; plan_id?: string; search?: string; page?: number; limit?: number }) =>
    [...adminSubscriptionKeys.lists(), params] as const,
  details: () => [...adminSubscriptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminSubscriptionKeys.details(), id] as const,
  activity: (id: string) => [...adminSubscriptionKeys.all, 'activity', id] as const,
};

export const adminKitchenKeys = {
  all: ['admin', 'kitchen'] as const,
  report: (outletId: string, date?: string) =>
    [...adminKitchenKeys.all, 'report', outletId, date] as const,
  consumption: (outletId: string, date?: string) =>
    [...adminKitchenKeys.all, 'consumption', outletId, date] as const,
};

export const adminOrderKeys = {
  all: ['admin', 'orders'] as const,
  lists: () => [...adminOrderKeys.all, 'list'] as const,
  list: (params?: AdminOrderListParams) => [...adminOrderKeys.lists(), params] as const,
  details: () => [...adminOrderKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminOrderKeys.details(), id] as const,
};

export const adminRouteKeys = {
  all: (outletId: string) => ['admin', 'outlets', outletId, 'routes'] as const,
  lists: (outletId: string) => [...adminRouteKeys.all(outletId), 'list'] as const,
  list: (outletId: string, params?: { date?: string }) => [...adminRouteKeys.lists(outletId), params] as const,
};

export const adminCorporateKeys = {
  all: ['admin', 'corporate'] as const,
  lists: () => [...adminCorporateKeys.all, 'list'] as const,
  list: (params?: AdminCorporateOrderListParams) => [...adminCorporateKeys.lists(), params] as const,
  details: () => [...adminCorporateKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCorporateKeys.details(), id] as const,
  modifications: (id: string) => [...adminCorporateKeys.all, 'modifications', id] as const,
  invoices: (id: string) => [...adminCorporateKeys.all, 'invoices', id] as const,
  dailyOrders: (id: string, params?: AdminCorporateDailyOrderListParams) => [...adminCorporateKeys.all, 'daily-orders', id, params] as const,
  invoiceLists: () => [...adminCorporateKeys.all, 'invoice-list'] as const,
  invoiceList: (params?: AdminCorporateInvoiceListParams) => [...adminCorporateKeys.invoiceLists(), params] as const,
  invoiceDetails: () => [...adminCorporateKeys.all, 'invoice-detail'] as const,
  invoiceDetail: (id: string) => [...adminCorporateKeys.invoiceDetails(), id] as const,
  dailyOrderLists: () => [...adminCorporateKeys.all, 'daily-order-list'] as const,
  dailyOrderList: (params?: AdminCorporateDailyOrderListParams) => [...adminCorporateKeys.dailyOrderLists(), params] as const,
  dailyOrderSummary: (params?: { outlet_id?: string; date?: string }) => [...adminCorporateKeys.all, 'daily-order-summary', params] as const,
  companies: () => [...adminCorporateKeys.all, 'companies'] as const,
  companyList: (params?: AdminCorporateCompanyListParams) => [...adminCorporateKeys.companies(), params] as const,
  companyDetail: (id: string) => [...adminCorporateKeys.all, 'company', id] as const,
  companyOrders: (id: string, params?: PaginationParams) => [...adminCorporateKeys.all, 'company-orders', id, params] as const,
  companyInvoices: (id: string, params?: PaginationParams) => [...adminCorporateKeys.all, 'company-invoices', id, params] as const,
};

export const adminReportKeys = {
  operations: (params: IOperationsReportQuery) => ['admin', 'reports', 'operations', params] as const,
  financial: (params: IFinancialReportQuery) => ['admin', 'reports', 'financial', params] as const,
  revenueAnalytics: (params: IRevenueAnalyticsQuery) => ['admin', 'reports', 'revenue-analytics', params] as const,
};

export const adminDashboardKeys = {
  overview: ['admin', 'dashboard', 'overview'] as const,
};

export const inventoryKeys = {
  all: ['admin', 'inventory'] as const,
  ingredientLists: () => [...inventoryKeys.all, 'ingredients', 'list'] as const,
  ingredientList: (params?: unknown) => [...inventoryKeys.ingredientLists(), params] as const,
  ingredientDetails: () => [...inventoryKeys.all, 'ingredients', 'detail'] as const,
  ingredientDetail: (id: string) => [...inventoryKeys.ingredientDetails(), id] as const,
  supplierLists: () => [...inventoryKeys.all, 'suppliers', 'list'] as const,
  supplierList: (params?: unknown) => [...inventoryKeys.supplierLists(), params] as const,
  supplierDetails: () => [...inventoryKeys.all, 'suppliers', 'detail'] as const,
  supplierDetail: (id: string) => [...inventoryKeys.supplierDetails(), id] as const,
  stockLists: () => [...inventoryKeys.all, 'stock'] as const,
  stockLevels: (outletId?: string) => [...inventoryKeys.stockLists(), 'levels', outletId] as const,
  lowStock: (outletId?: string) => [...inventoryKeys.stockLists(), 'low', outletId] as const,
  movementLists: () => [...inventoryKeys.all, 'movements', 'list'] as const,
  movementList: (params?: unknown) => [...inventoryKeys.movementLists(), params] as const,
  purchaseOrderLists: () => [...inventoryKeys.all, 'purchase-orders', 'list'] as const,
  purchaseOrderList: (params?: unknown) => [...inventoryKeys.purchaseOrderLists(), params] as const,
  purchaseOrderDetails: () => [...inventoryKeys.all, 'purchase-orders', 'detail'] as const,
  purchaseOrderDetail: (id: string) => [...inventoryKeys.purchaseOrderDetails(), id] as const,
  recipeIngredients: (recipeId: string) => [...inventoryKeys.all, 'recipe-ingredients', recipeId] as const,
};

export const adminAddOnKeys = {
  all: ['admin', 'add-ons'] as const,
  lists: () => [...adminAddOnKeys.all, 'list'] as const,
  list: (params?: unknown) => [...adminAddOnKeys.lists(), params] as const,
  details: () => [...adminAddOnKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminAddOnKeys.details(), id] as const,
};
