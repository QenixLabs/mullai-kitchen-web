"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adminRouteApi,
  type GenerateRoutesPayload,
  type AssignPartnerPayload,
} from "@/api/admin-route.api";
import { adminRouteKeys, adminOrderKeys } from "@/api/query-keys";

export function useOutletRoutes(outletId: string | null, date?: string) {
  return useQuery({
    queryKey: adminRouteKeys.list(outletId!, { date }),
    queryFn: () => adminRouteApi.list(outletId!, date),
    enabled: !!outletId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useGenerateRoutes(outletId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateRoutesPayload) => adminRouteApi.generate(outletId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRouteKeys.all(outletId) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      toast.success("Routes generated successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to generate routes");
    },
  });
}

export function useAssignPartner(outletId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeId, data }: { routeId: string; data: AssignPartnerPayload }) =>
      adminRouteApi.assignPartner(outletId, routeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRouteKeys.all(outletId) });
      toast.success("Partner assigned successfully");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to assign partner");
    },
  });
}

export function useStartRoute(outletId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => adminRouteApi.startRoute(outletId, routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRouteKeys.all(outletId) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      toast.success("Route started");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to start route");
    },
  });
}

export function useCompleteRoute(outletId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => adminRouteApi.completeRoute(outletId, routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRouteKeys.all(outletId) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      toast.success("Route completed");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to complete route");
    },
  });
}

export function useDeleteRoute(outletId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (routeId: string) => adminRouteApi.deleteRoute(outletId, routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRouteKeys.all(outletId) });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.lists() });
      toast.success("Route deleted");
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || "Failed to delete route");
    },
  });
}
