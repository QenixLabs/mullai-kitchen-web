"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deliveryApi } from "@/api/delivery.api";
import type {
  DeliveryOrderType,
  DeliveryRouteStatus,
  UpdateAvailabilityBody,
  UpdateStopBody,
} from "@/api/types/delivery.types";

/**
 * Query-key factory for the partner-facing delivery module.
 *
 * Strategy:
 * - All keys are prefixed by `['delivery']` so the entire module can be
 *   invalidated as a unit (e.g. on logout).
 * - Route lists are scoped by `(date, status)` since the server filters by
 *   both. Missing values fall back to the literal `'today'` / `'all'` so the
 *   key is stable across renders.
 * - Route detail keys are scoped by route id and live under the same
 *   `'routes'` namespace as the lists so a wholesale `routes` invalidation
 *   refreshes both list and detail caches.
 */
export const deliveryQueryKeys = {
  all: ["delivery"] as const,
  routes: () => [...deliveryQueryKeys.all, "routes"] as const,
  myRoutes: (params?: { date?: string; status?: DeliveryRouteStatus; meal_type?: string }) =>
    [
      ...deliveryQueryKeys.routes(),
      "list",
      {
        date: params?.date ?? "today",
        status: params?.status ?? "all",
        meal_type: params?.meal_type ?? "all",
      },
    ] as const,
  routeDetail: (id: string) =>
    [...deliveryQueryKeys.routes(), "detail", id] as const,
  me: () => [...deliveryQueryKeys.all, "me"] as const,
};

// ---------- Queries -------------------------------------------------------

/** List the current partner's routes for the given date / status. */
export function useMyRoutes(
  params?: { date?: string; status?: DeliveryRouteStatus; meal_type?: string },
) {
  return useQuery({
    queryKey: deliveryQueryKeys.myRoutes(params),
    queryFn: () => deliveryApi.listMyRoutes(params),
    staleTime: 1000 * 60, // 1 minute — partner is actively working the list
  });
}

/** Full detail for a single route. */
export function useRouteDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: deliveryQueryKeys.routeDetail(id ?? ""),
    queryFn: () => deliveryApi.getRouteDetail(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

/** Profile snapshot for the current delivery partner. */
export function useDeliveryProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: deliveryQueryKeys.me(),
    queryFn: () => deliveryApi.getMe(),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
}

// ---------- Mutations -----------------------------------------------------

/** Start a route — flips it to IN_PROGRESS and cascades order statuses. */
export function useStartRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => deliveryApi.startRoute(routeId),
    onSuccess: (_data, routeId) => {
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.routes() });
      queryClient.invalidateQueries({
        queryKey: deliveryQueryKeys.routeDetail(routeId),
      });
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.me() });
      toast.success("Route started");
    },
    onError: (error: { message?: string } | Error) => {
      toast.error(
        (error as { message?: string })?.message || "Failed to start route",
      );
    },
  });
}

/**
 * Mark a single stop's order as delivered / missed.
 *
 * NOTE: optimistic updates are intentionally deferred to DEL-013 — this
 * version invalidates the affected route detail on success.
 */
export function useUpdateStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routeId,
      orderType,
      orderId,
      body,
    }: {
      routeId: string;
      orderType: DeliveryOrderType;
      orderId: string;
      body: UpdateStopBody;
    }) => deliveryApi.markStop(routeId, orderType, orderId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: deliveryQueryKeys.routeDetail(variables.routeId),
      });
      // List cards display `completed_stops / order_count`, so refresh lists too.
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.routes() });
    },
    onError: (error: { message?: string } | Error) => {
      toast.error(
        (error as { message?: string })?.message || "Failed to update stop",
      );
    },
  });
}

/** Complete a route — flips it to COMPLETED and resets partner availability. */
export function useCompleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => deliveryApi.completeRoute(routeId),
    onSuccess: (_data, routeId) => {
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.routes() });
      queryClient.invalidateQueries({
        queryKey: deliveryQueryKeys.routeDetail(routeId),
      });
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.me() });
      toast.success("Route completed");
    },
    onError: (error: { message?: string } | Error) => {
      toast.error(
        (error as { message?: string })?.message || "Failed to complete route",
      );
    },
  });
}

/** Toggle the partner's availability between Available and Inactive. */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateAvailabilityBody) =>
      deliveryApi.updateAvailability(body),
    onSuccess: (data) => {
      // Seed the cache with the fresh profile so the UI updates instantly.
      queryClient.setQueryData(deliveryQueryKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.me() });
      toast.success("Availability updated");
    },
    onError: (error: { message?: string } | Error) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Failed to update availability",
      );
    },
  });
}
