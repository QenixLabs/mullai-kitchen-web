import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import type { KitchenReportResponse } from '@/api/types/kitchen-report.types';

export function useKitchenReport(outletId: string, date?: string) {
  return useQuery<KitchenReportResponse>({
    queryKey: ['kitchen-report', outletId, date],
    queryFn: () => adminApi.getKitchenReport(outletId, date),
    staleTime: 1000 * 60 * 2,
    enabled: !!outletId,
  });
}

export async function downloadKitchenPdf(outletId: string, date?: string): Promise<void> {
  const blob = await adminApi.downloadKitchenPdf(outletId, date);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = date || new Date().toISOString().split('T')[0];
  a.download = `kitchen-report-${dateStr}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
