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
  MealType,
} from "@/api/types/addons.types";

// Query return types
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

// Queries
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

// Mutations
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
