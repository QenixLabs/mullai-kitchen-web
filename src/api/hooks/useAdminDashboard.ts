'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { adminDashboardKeys } from '@/api/query-keys';
import type { IDashboardResponse } from '@/api/types/admin.types';

export function useDashboardData() {
  return useQuery<IDashboardResponse>({
    queryKey: adminDashboardKeys.overview,
    queryFn: () => adminApi.getDashboardData(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // auto-refetch every 2 minutes
  });
}
