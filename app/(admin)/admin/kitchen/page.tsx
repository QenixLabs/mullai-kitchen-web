'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Printer,
  FileDown,
  ChefHat,
  CalendarOff,
  CalendarDays,
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Can } from '@/components/Auth/can';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useKitchenReport, useConsumptionProjection } from '@/api/hooks/useAdminKitchen';
import { KitchenSummaryCards } from '@/components/admin/kitchen/KitchenSummaryCards';
import { KitchenItemsTable } from '@/components/admin/kitchen/KitchenItemsTable';
import { KitchenCorporateSummary } from '@/components/admin/kitchen/KitchenCorporateSummary';
import { KitchenCorporateBreakdown } from '@/components/admin/kitchen/KitchenCorporateBreakdown';
import { KitchenIngredientConsumption } from '@/components/admin/kitchen/KitchenIngredientConsumption';

export default function KitchenPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: outletsData, isLoading: outletsLoading, error: outletsError } = useOutlets({ status: 'active' });

  useEffect(() => {
    if (!canViewAnyOutlet && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [canViewAnyOutlet, user?.assigned_outlet_id]);

  useEffect(() => {
    if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data?.length]);

  const dateParam = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: report, isLoading: reportLoading, error: reportError } = useKitchenReport(selectedOutletId, dateParam);
  const { data: consumptionProjection, isLoading: consumptionLoading } = useConsumptionProjection(selectedOutletId, dateParam);

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  }, [selectedDate]);

  const selectedOutletName = useMemo(() => {
    return outletsData?.data?.find((o) => o._id === selectedOutletId)?.name;
  }, [outletsData?.data, selectedOutletId]);

  return (
    <Can
      permission="order:kitchen"
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You do not have permission to view the kitchen report.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ChefHat className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Kitchen Report</h1>
              <p className="text-sm text-muted-foreground">
                Daily production counts, recipes, and corporate breakdowns.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-9">
              <Printer className="mr-1.5 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" disabled className="h-9">
              <FileDown className="mr-1.5 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block">
          <h1 className="text-xl font-bold text-foreground">Kitchen Report</h1>
          <p className="text-sm text-muted-foreground">
            {selectedOutletName ? `${selectedOutletName} · ` : ''}
            {selectedDate ? format(selectedDate, 'PPP') : ''}
          </p>
        </div>

        {/* Errors */}
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

        {/* Toolbar */}
        <Card className="border-border/70 shadow-sm print:hidden">
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {canViewAnyOutlet ? (
                <>
                  <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                    Outlet
                  </span>
                  {outletsLoading ? (
                    <Skeleton className="h-9 w-[260px]" />
                  ) : (
                    <Select value={selectedOutletId ?? ''} onValueChange={handleOutletChange}>
                      <SelectTrigger className="h-9 w-[260px] gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
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
                </>
              ) : selectedOutletName ? (
                <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-foreground">{selectedOutletName}</span>
                </div>
              ) : (
                <Skeleton className="h-9 w-64" />
              )}
            </div>
            <Separator orientation="vertical" className="hidden h-9 lg:block" />
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Date
              </span>
              <DatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
                placeholder="Select date"
                className="h-9 w-[200px]"
              />
              {isToday && (
                <Badge
                  variant="secondary"
                  className="h-5 border-0 bg-primary/10 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                >
                  <CalendarDays className="mr-1 h-3 w-3" />
                  Today
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedOutletId ? (
          <>
            {/* Summary Cards */}
            <KitchenSummaryCards
              summary={report?.summary}
              combined_summary={report?.combined_summary}
              loading={reportLoading}
            />

            {/* Items Table */}
            <KitchenItemsTable items={report?.items} loading={reportLoading} />

            {/* Corporate Summary */}
            <KitchenCorporateSummary corporate_summary={report?.corporate_summary} loading={reportLoading} />

            {/* Corporate Breakdown */}
            <KitchenCorporateBreakdown items={report?.corporate_items} loading={reportLoading} />

            {/* Ingredient Consumption */}
            <KitchenIngredientConsumption
              projections={consumptionProjection}
              loading={consumptionLoading}
            />
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <CalendarOff className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Select an outlet to begin</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose an outlet from the toolbar to view today&apos;s production report.
                </p>
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
          </Card>
        )}
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
    </Can>
  );
}
