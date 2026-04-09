import { apiClient } from "@/api/client";
import { ADD_ON_ROUTES } from "@/api/routes";
import type {
  AddOnItem,
  CartSummary,
  CheckoutPrepareRequest,
  CheckoutPrepareResponse,
  CreateAddOnOrderRequest,
  ActiveAddOnOrder,
  MealType,
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
   * Prepares checkout with payment details
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
   * Creates an add-on order
   */
  createAddOnOrder: async (
    subscriptionId: string,
    payload: CreateAddOnOrderRequest
  ): Promise<CreateAddOnOrderResponse> => {
    const response = await apiClient.post<CreateAddOnOrderResponse>(
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
