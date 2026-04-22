'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Printer,
  FileDown,
  RefreshCw,
  CalendarDays,
  Store,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Can } from '@/components/Auth/can';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useKitchenReport } from '@/api/hooks/useAdminKitchen';
import { KitchenSummaryCards } from '@/components/admin/kitchen/KitchenSummaryCards';
import { KitchenItemsTable } from '@/components/admin/kitchen/KitchenItemsTable';

export default function KitchenPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const {
    data: outletsData,
    isLoading: outletsLoading,
    error: outletsError,
  } = useOutlets({ status: 'active' });

  // For non-admin users (Hub Owners, Outlet Admins), pre-select their assigned outlet
  useEffect(() => {
    if (!canViewAnyOutlet && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [canViewAnyOutlet, user?.assigned_outlet_id]);

  // Auto-select first outlet for admin/super-admin when list loads
  useEffect(() => {
    if (
      canViewAnyOutlet &&
      !selectedOutletId &&
      outletsData?.data?.length
    ) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data?.length]);

  const dateParam = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : undefined;
  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
    refetch,
  } = useKitchenReport(selectedOutletId, dateParam);

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!canViewAnyOutlet && !selectedOutletId) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Kitchen Report"
          subtitle="Loading outlet information..."
        />
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  return (
    <Can
      permission="order:kitchen"
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-[#3d000c]">
              Access Denied
            </h2>
            <p className="text-sm text-[#554243]">
              You do not have permission to view the kitchen report.
            </p>
          </div>
        </div>
      }
    >
      <>
        <div className="space-y-6">
          {/* Header with inline controls */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <AdminPageHeader
              title="KITCHEN REPORT"
              subtitle="Today's meal preparation summary"
            />

            {/* Top Controls */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              {/* Date Picker */}
              <div className="flex items-center gap-2 rounded-xl border border-[rgba(219,192,193,0.3)] bg-white px-3 py-2">
                <CalendarDays className="h-4 w-4 text-[#554243]" />
                <DatePicker
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  placeholder="Select date"
                  className="w-36 border-0 bg-transparent p-0 shadow-none"
                />
              </div>

              {/* Outlet Selector */}
              {canViewAnyOutlet && (
                <div className="flex items-center gap-2 rounded-xl border border-[rgba(219,192,193,0.3)] bg-white px-3 py-2">
                  <Store className="h-4 w-4 text-[#554243]" />
                  {outletsLoading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    <Select
                      value={selectedOutletId ?? ''}
                      onValueChange={handleOutletChange}
                    >
                      <SelectTrigger className="w-48 border-0 bg-transparent p-0 shadow-none">
                        <SelectValue placeholder="Select outlet" />
                      </SelectTrigger>
                      <SelectContent>
                        {(outletsData?.data || []).map((outlet) => (
                          <SelectItem key={outlet._id} value={outlet._id}>
                            {outlet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(219,192,193,0.3)] bg-white text-[#554243] transition-colors hover:bg-[#f8f5f5] hover:text-[#44151c]"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePrint}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(219,192,193,0.3)] bg-white text-[#554243] transition-colors hover:bg-[#f8f5f5] hover:text-[#44151c]"
                  title="Print"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  disabled
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(219,192,193,0.3)] bg-white text-[#554243]/40"
                  title="Export"
                >
                  <FileDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error States */}
          {outletsError && (
            <div
              className="rounded-3xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm text-red-600">
                Failed to load outlets. Please try again later.
              </p>
            </div>
          )}
          {reportError && (
            <div
              className="rounded-3xl border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm text-red-600">
                Failed to load kitchen report. Please try again later.
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <KitchenSummaryCards
            summary={report?.summary}
            loading={reportLoading}
          />

          {/* Items + Timeline + Recipe Cards */}
          <KitchenItemsTable
            items={report?.items}
            loading={reportLoading}
          />
        </div>

        {/* Print-specific styles */}
        <style>{`
          @media print {
            nav,
            aside,
            [data-sidebar],
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </>
    </Can>
  );
}
