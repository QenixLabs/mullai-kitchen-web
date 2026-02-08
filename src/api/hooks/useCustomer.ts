"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { customerApi } from "@/api/customer.api";
import { customerKeys } from "@/api/query-keys";
import type {
  CreateCheckoutOrderRequest,
  PrepareCheckoutRequest,
  QueryCustomerPlans,
} from "@/api/types/customer.types";

export function useCustomerPlans(params?: QueryCustomerPlans) {
  return useQuery({
    queryKey: customerKeys.plans(params),
    queryFn: () => customerApi.getPlans(params),
  });
}

export function useMenuPreview(planId: string | undefined) {
  return useQuery({
    queryKey: planId ? customerKeys.menuPreview(planId) : customerKeys.menuPreview(""),
    queryFn: () => customerApi.getMenuPreview(planId ?? ""),
    enabled: Boolean(planId),
  });
}

export function useServiceability() {
  return useMutation({
    mutationFn: (payload: { pincode: string }) => customerApi.checkServiceability(payload),
  });
}

export function usePrepareCheckout() {
  return useMutation({
    mutationFn: (payload: PrepareCheckoutRequest) => customerApi.prepareCheckout(payload),
  });
}

export function useCreateCheckoutOrder() {
  return useMutation({
    mutationFn: (payload: CreateCheckoutOrderRequest) => customerApi.createCheckoutOrder(payload),
  });
}
