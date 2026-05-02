import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { adminReportKeys } from '@/api/query-keys';
import type { IOperationsReportQuery, IOperationsReportItem, IFinancialReportQuery, IFinancialReportResponse } from '@/api/types/admin.types';

export function useOperationsReport(params: IOperationsReportQuery) {
  return useQuery<IOperationsReportItem[]>({
    queryKey: adminReportKeys.operations(params),
    queryFn: () => adminApi.getOperationsReport(params),
    staleTime: 1000 * 60 * 5,
    enabled: !!params.start_date && !!params.end_date,
  });
}

export function useFinancialReport(params: IFinancialReportQuery) {
  return useQuery<IFinancialReportResponse>({
    queryKey: adminReportKeys.financial(params),
    queryFn: () => adminApi.getFinancialReport(params),
    staleTime: 1000 * 60 * 5,
    enabled: !!params.start_date && !!params.end_date,
  });
}
