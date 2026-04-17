'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Building2, Printer, FileDown } from 'lucide-react';
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
  const { data: outletsData, isLoading: outletsLoading, error: outletsError } = useOutlets({ status: 'active' });

  // For non-admin users (Hub Owners, Outlet Admins), pre-select their assigned outlet
  useEffect(() => {
    if (!canViewAnyOutlet && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [canViewAnyOutlet, user?.assigned_outlet_id]);

  // Auto-select first outlet for admin/super-admin when list loads
  useEffect(() => {
    if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data?.length]);

  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: report, isLoading: reportLoading, error: reportError } = useKitchenReport(selectedOutletId, dateParam);

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!canViewAnyOutlet && !selectedOutletId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kitchen Report</h1>
          <p className="text-sm text-muted-foreground">Loading outlet information...</p>
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
    );
  }

  return (
    <Can
      permission="order:kitchen"
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">You do not have permission to view the kitchen report.</p>
          </div>
        </div>
      }
    >
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Kitchen Report</h1>
          <p className="text-sm text-muted-foreground">
            View daily kitchen production reports and meal counts.
          </p>
        </div>

        {/* Error States */}
        {outletsError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load outlets. Please try again later.</p>
          </div>
        )}
        {reportError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load kitchen report. Please try again later.</p>
          </div>
        )}

        {/* Controls - hidden in print */}
        <div className="print:hidden flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Outlet Selector - only for users who can view any outlet */}
          {canViewAnyOutlet && (
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {outletsLoading ? (
                <Skeleton className="h-10 w-64" />
              ) : (
                <Select
                  value={selectedOutletId ?? ''}
                  onValueChange={handleOutletChange}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select an outlet" />
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

          {/* Date Picker */}
          <DatePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            placeholder="Select date"
            className="w-56"
          />
        </div>

        {/* Summary Cards */}
        <KitchenSummaryCards
          summary={report?.summary}
          loading={reportLoading}
        />

        {/* Items Table */}
        <KitchenItemsTable
          items={report?.items}
          loading={reportLoading}
        />

        {/* Footer Actions - hidden in print */}
        <div className="print:hidden flex items-center gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
          <Button variant="outline" disabled>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
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
