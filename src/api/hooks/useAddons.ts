import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addOnsApi } from "@/api/addons.api";
import { addOnKeys, paymentKeys } from "@/api/query-keys";
import type {
  AddOnItem,
  CartSummary,
  CheckoutPrepareRequest,
  CheckoutPrepareResponse,
  CreateAddOnOrderRequest,
  CreateAddOnOrderResponse,
  ActiveAddOnOrder,
  AvailableAddOnsIndependentData,
  MealTypesResponse,
  MealType,
  AddOnOrderHistoryResponse,
  AddOnOrderHistoryParams,
} from "@/api/types/addons.types";

// ──────────────────────────────────────────────────────────────
// Independent query return types (no subscription context)
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// Legacy query return types (subscription-scoped)
// ──────────────────────────────────────────────────────────────

interface AvailableAddOnsData {
  items: AddOnItem[];
  subscription_id: string;
  delivery_date: string;
  subscription_meal_types: MealType[];
}

interface ActiveAddOnsData {
  orders: ActiveAddOnOrder[];
  subscription_id: string;
  total: number;
}

// ──────────────────────────────────────────────────────────────
// Independent Queries (no subscription ID required)
// ──────────────────────────────────────────────────────────────

/**
 * Fetch ALL available add-ons without subscription-level filtering.
 * The server resolves meal types from the user's active subscriptions.
 */
export function useAvailableAddOnsIndependent(
  params?: { delivery_date?: string }
) {
  return useQuery<AvailableAddOnsIndependentData>({
    queryKey: addOnKeys.availableIndependent(params),
    queryFn: () => addOnsApi.getAvailableAddOnsIndependent(params),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Fetch the meal types available from the user's active subscriptions.
 * Used at checkout to determine which meal types the user can order for.
 */
export function useMealTypes(options?: { enabled?: boolean }) {
  return useQuery<MealTypesResponse>({
    queryKey: addOnKeys.mealTypes(),
    queryFn: () => addOnsApi.getMealTypes(),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

/**
 * Fetch paginated add-on order history for the current user across all subscriptions.
 */
export function useAddOnOrderHistory(params?: AddOnOrderHistoryParams) {
  return useQuery<AddOnOrderHistoryResponse>({
    queryKey: addOnKeys.orderHistory(params),
    queryFn: () => addOnsApi.getAddOnOrderHistory(params),
    staleTime: 60_000,
  });
}

// ──────────────────────────────────────────────────────────────
// Independent Mutations (no subscription ID required)
// ──────────────────────────────────────────────────────────────

/**
 * Prepare checkout using meal_type — subscription is resolved server-side.
 * Returns payment details including Zoho / Razorpay session info.
 */
export function usePrepareCheckoutIndependent() {
  return useMutation<
    CheckoutPrepareResponse,
    Error,
    CheckoutPrepareRequest
  >({
    mutationFn: (data) => addOnsApi.prepareCheckoutIndependent(data),
  });
}

/**
 * Create an add-on order using meal_type — subscription is resolved server-side.
 * Accepts optional payment_id, payments_session_id, and razorpay_order_id for Zoho / Razorpay confirmation.
 */
export function useCreateAddOnOrderIndependent() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAddOnOrderResponse,
    Error,
    CreateAddOnOrderRequest
  >({
    mutationFn: (data) => addOnsApi.createAddOnOrderIndependent(data),
    onSuccess: () => {
      // Invalidate all add-on queries and wallet caches
      queryClient.invalidateQueries({ queryKey: addOnKeys.all() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.walletBalance() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.walletTransactions() });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// Legacy Queries (subscription-scoped — kept for backward compat)
// ──────────────────────────────────────────────────────────────

export function useAvailableAddOns(
  subscriptionId: string,
  params?: { delivery_date?: string; meal_type?: MealType }
) {
  return useQuery<AvailableAddOnsData>({
    queryKey: addOnKeys.available(subscriptionId, params),
    queryFn: () => addOnsApi.getAvailableAddOns(subscriptionId, params),
    enabled: !!subscriptionId,
    staleTime: 60_000, // 1 minute
  });
}

export function useCartSummary(
  subscriptionId: string,
  payload: {
    items: { item_id: string; quantity: number; meal_type: MealType }[];
    delivery_date: string;
  } | null
) {
  return useQuery<CartSummary>({
    queryKey: [...addOnKeys.cartSummary(subscriptionId), payload],
    queryFn: () => {
      if (!payload) throw new Error("Payload is required");
      return addOnsApi.getCartSummary(subscriptionId, payload);
    },
    enabled: !!subscriptionId && !!payload && payload.items.length > 0,
    staleTime: 30_000, // 30 seconds
  });
}

export function useActiveAddOnOrders(subscriptionId: string) {
  return useQuery<ActiveAddOnsData>({
    queryKey: addOnKeys.activeOrders(subscriptionId),
    queryFn: () => addOnsApi.getActiveAddOnOrders(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 60_000,
  });
}

// ──────────────────────────────────────────────────────────────
// Legacy Mutations (subscription-scoped — kept for backward compat)
// ──────────────────────────────────────────────────────────────

export function usePrepareCheckout() {
  return useMutation<
    CheckoutPrepareResponse,
    Error,
    { subscriptionId: string; data: CheckoutPrepareRequest }
  >({
    mutationFn: ({ subscriptionId, data }) =>
      addOnsApi.prepareCheckout(subscriptionId, data),
  });
}

export function useCreateAddOnOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAddOnOrderResponse,
    Error,
    { subscriptionId: string; data: CreateAddOnOrderRequest }
  >({
    mutationFn: ({ subscriptionId, data }) =>
      addOnsApi.createAddOnOrder(subscriptionId, data),
    onSuccess: (_, variables) => {
      // Invalidate active orders and wallet balance after creating an order
      queryClient.invalidateQueries({
        queryKey: addOnKeys.activeOrders(variables.subscriptionId),
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.walletBalance(),
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.walletTransactions(),
      });
    },
  });
}
