import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import type { IDashboardResponse } from '@/api/types/admin.types';

/**
 * Hook to fetch admin dashboard data
 * Data is filtered by user permissions on the backend
 */
export function useAdminDashboard() {
  return useQuery<IDashboardResponse>({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
