// ===========================================
// Admin Dashboard Types
// ===========================================

/**
 * Trend data for KPI cards
 */
export interface IKPITrend {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  period?: string;
}

/**
 * Subscription metrics for dashboard
 */
export interface ISubscriptionMetrics {
  active: number;
  trend?: IKPITrend;
}

/**
 * Order metrics for dashboard
 */
export interface IOrderMetrics {
  today: number;
  pending: number;
  trend?: IKPITrend;
}

/**
 * Revenue metrics for dashboard
 */
export interface IRevenueMetrics {
  today: number;
  month: number;
  trend?: IKPITrend;
  currency?: string;
}

/**
 * User metrics for dashboard
 */
export interface IUserMetrics {
  total: number;
  new: number;
  trend?: IKPITrend;
}

/**
 * Outlet metrics for dashboard
 */
export interface IOutletMetrics {
  active: number;
  total: number;
  trend?: IKPITrend;
}

/**
 * Kitchen metrics for dashboard
 */
export interface IKitchenMetrics {
  mealsToday: number;
  pending: number;
  trend?: IKPITrend;
}

/**
 * Route metrics for dashboard
 */
export interface IRouteMetrics {
  active: number;
  pending: number;
  trend?: IKPITrend;
}

/**
 * Alert item for dashboard
 */
export interface IDashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  action?: {
    label: string;
    href: string;
  };
}

/**
 * Corporate metrics for dashboard
 */
export interface ICorporateMetrics {
  activeOrders: number;
  overdueInvoices: number;
  todayMeals: number;
  ordersTrend?: IKPITrend;
  invoicesTrend?: IKPITrend;
  mealsTrend?: IKPITrend;
}

/**
 * Dashboard response from API
 */
export interface IDashboardResponse {
  subscriptions?: ISubscriptionMetrics;
  orders?: IOrderMetrics;
  revenue?: IRevenueMetrics;
  users?: IUserMetrics;
  outlets?: IOutletMetrics;
  kitchen?: IKitchenMetrics;
  routes?: IRouteMetrics;
  corporate?: ICorporateMetrics;
  alerts?: IDashboardAlert[];
  lastUpdated?: string;
}
