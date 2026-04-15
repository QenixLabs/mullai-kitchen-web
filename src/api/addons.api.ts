import { apiClient } from "@/api/client";
import { ADD_ON_ROUTES } from "@/api/routes";
import type {
  AddOnItem,
  CartSummary,
  CheckoutPrepareRequest,
  CheckoutPrepareResponse,
  CreateAddOnOrderRequest,
  CreateAddOnOrderResponse as CreateAddOnOrderResponseType,
  ActiveAddOnOrder,
  AvailableAddOnsIndependentData,
  MealTypesResponse,
  MealType,
  AddOnOrderHistoryResponse,
  AddOnOrderHistoryParams,
} from "@/api/types/addons.types";

export interface AvailableAddOnsResponse {
  items: AddOnItem[];
  subscription_id: string;
  delivery_date: string;
  subscription_meal_types: MealType[];
}

export interface ActiveAddOnsResponse {
  orders: ActiveAddOnOrder[];
  subscription_id: string;
  total: number;
}

export interface CreateAddOnOrderResponse {
  success: boolean;
  message: string;
  order_id?: string;
  total_amount?: number;
}

export const addOnsApi = {
  // ──────────────────────────────────────────────────────────────
  // Independent endpoints (no subscription ID required)
  // ──────────────────────────────────────────────────────────────

  /**
   * Gets ALL available add-ons without subscription-level filtering.
   * Meal types are resolved server-side from the user's active subscriptions.
   */
  getAvailableAddOnsIndependent: async (
    params?: { delivery_date?: string }
  ): Promise<AvailableAddOnsIndependentData> => {
    const response = await apiClient.get<AvailableAddOnsIndependentData>(
      ADD_ON_ROUTES.AVAILABLE_INDEPENDENT,
      { params }
    );
    return response.data;
  },

  /**
   * Gets available meal types from the user's active subscriptions
   */
  getMealTypes: async (): Promise<MealTypesResponse> => {
    const response = await apiClient.get<MealTypesResponse>(
      ADD_ON_ROUTES.MEAL_TYPES
    );
    return response.data;
  },

  /**
   * Prepares checkout using meal_type (subscription resolved server-side)
   */
  prepareCheckoutIndependent: async (
    payload: CheckoutPrepareRequest
  ): Promise<CheckoutPrepareResponse> => {
    const response = await apiClient.post<CheckoutPrepareResponse>(
      ADD_ON_ROUTES.PREPARE_CHECKOUT_INDEPENDENT,
      payload
    );
    return response.data;
  },

  /**
   * Creates an add-on order using meal_type (subscription resolved server-side)
   */
  createAddOnOrderIndependent: async (
    payload: CreateAddOnOrderRequest
  ): Promise<CreateAddOnOrderResponseType> => {
    const response = await apiClient.post<CreateAddOnOrderResponseType>(
      ADD_ON_ROUTES.CREATE_ORDER_INDEPENDENT,
      payload
    );
    return response.data;
  },

  /**
   * Gets paginated order history for the user across all subscriptions
   */
  getAddOnOrderHistory: async (
    params?: AddOnOrderHistoryParams
  ): Promise<AddOnOrderHistoryResponse> => {
    const response = await apiClient.get<AddOnOrderHistoryResponse>(
      ADD_ON_ROUTES.ORDER_HISTORY,
      { params }
    );
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────
  // Legacy subscription-scoped endpoints (kept for backward compat)
  // ──────────────────────────────────────────────────────────────

  /**
   * Gets available add-ons for a subscription
   */
  getAvailableAddOns: async (
    subscriptionId: string,
    params?: { delivery_date?: string; meal_type?: MealType }
  ): Promise<AvailableAddOnsResponse> => {
    const response = await apiClient.get<AvailableAddOnsResponse>(
      ADD_ON_ROUTES.AVAILABLE(subscriptionId),
      { params }
    );
    return response.data;
  },

  /**
   * Gets cart summary with validation and totals
   */
  getCartSummary: async (
    subscriptionId: string,
    payload: {
      items: { item_id: string; quantity: number; meal_type: MealType }[];
      delivery_date: string;
    }
  ): Promise<CartSummary> => {
    const response = await apiClient.post<CartSummary>(
      ADD_ON_ROUTES.CART_SUMMARY(subscriptionId),
      payload
    );
    return response.data;
  },

  /**
   * Prepares checkout with payment details (subscription-scoped)
   */
  prepareCheckout: async (
    subscriptionId: string,
    payload: CheckoutPrepareRequest
  ): Promise<CheckoutPrepareResponse> => {
    const response = await apiClient.post<CheckoutPrepareResponse>(
      ADD_ON_ROUTES.PREPARE_CHECKOUT(subscriptionId),
      payload
    );
    return response.data;
  },

  /**
   * Creates an add-on order (subscription-scoped)
   */
  createAddOnOrder: async (
    subscriptionId: string,
    payload: CreateAddOnOrderRequest
  ): Promise<CreateAddOnOrderResponseType> => {
    const response = await apiClient.post<CreateAddOnOrderResponseType>(
      ADD_ON_ROUTES.CREATE_ORDER(subscriptionId),
      payload
    );
    return response.data;
  },

  /**
   * Gets active add-on orders for a subscription
   */
  getActiveAddOnOrders: async (
    subscriptionId: string
  ): Promise<ActiveAddOnsResponse> => {
    const response = await apiClient.get<ActiveAddOnsResponse>(
      ADD_ON_ROUTES.ACTIVE_ORDERS(subscriptionId)
    );
    return response.data;
  },
};
