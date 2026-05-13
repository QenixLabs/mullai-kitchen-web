"use client";

import { useQuery } from "@tanstack/react-query";
import { adminKitchenApi } from "@/api/admin-kitchen.api";
import { adminKitchenKeys } from "@/api/query-keys";

export function useKitchenReport(outletId: string | null, date?: string) {
  return useQuery({
    queryKey: adminKitchenKeys.report(outletId!, date),
    queryFn: () => adminKitchenApi.getReport(outletId!, date),
    enabled: !!outletId,
    staleTime: 1000 * 60 * 2,
  });
}
