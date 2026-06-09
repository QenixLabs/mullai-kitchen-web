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
  outstandingAmount?: number;
  ordersTrend?: IKPITrend;
  invoicesTrend?: IKPITrend;
  mealsTrend?: IKPITrend;
}

/**
 * Ingredient usage item for dashboard
 */
export interface IIngredientUsageItem {
  ingredientId: string;
  name: string;
  category: string;
  quantityUsed: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

/**
 * Expense metrics for dashboard
 */
export interface IExpenseMetrics {
  totalExpense: number;
  totalStockUsed: number;
  remainingInventoryValue: number;
  currency?: string;
  trend?: IKPITrend;
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
  expenses?: IExpenseMetrics;
  ingredientUsage?: IIngredientUsageItem[];
  alerts?: IDashboardAlert[];
  lastUpdated?: string;
}

// Report types
export type ReportGranularity = 'daily' | 'weekly' | 'monthly';

export interface IOperationsReportQuery {
  start_date: string;
  end_date: string;
  outlet_id?: string;
  granularity?: ReportGranularity;
}

export interface IOperationsReportItem {
  period: string;
  orders_count: number;
  revenue: number;
  delivery_success_rate: number;
  avg_delivery_time_minutes: number;
  breakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
}

export interface IFinancialReportQuery {
  start_date: string;
  end_date: string;
  outlet_id?: string;
}

export interface IPaymentMethodDistribution {
  method: string;
  amount: number;
  percentage: number;
}

export interface IDailyFinancialBreakdown {
  date: string;
  total: number;
  subscription: number;
  one_time: number;
}

export interface IFinancialReportResponse {
  total_revenue: number;
  subscription_revenue: number;
  one_time_revenue: number;
  refunds: number;
  outstanding: number;
  payment_methods: IPaymentMethodDistribution[];
  daily_breakdown: IDailyFinancialBreakdown[];
}

// Revenue Analytics Types

export interface IRevenueAnalyticsQuery {
  start_date: string;
  end_date: string;
  outlet_id?: string;
  granularity?: ReportGranularity;
}

export interface IDailyRevenueBreakdown {
  date: string;
  individual_revenue: number;
  addon_revenue: number;
  corporate_revenue: number;
  total_revenue: number;
  procurement_expense: number;
  ingredient_expense: number;
  profit_or_loss: number;
}

export interface IRevenueAnalyticsResponse {
  individual_revenue: number;
  addon_revenue: number;
  corporate_revenue: number;
  total_revenue: number;
  total_procurement_expense: number;
  total_ingredient_expense: number;
  profit_or_loss: number;
  daily_breakdown: IDailyRevenueBreakdown[];
}
