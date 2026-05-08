'use client';

import { useCallback } from 'react';
import { format } from 'date-fns';
import { Building2, CalendarDays, BarChart3, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Can } from '@/components/Auth/can';
import { useHasPermission } from '@/hooks/useHasPermission';
import type { ReportGranularity } from '@/api/types/admin.types';

export interface ReportFiltersState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  outletId: string | undefined;
  granularity: ReportGranularity;
}

interface OutletOption {
  _id: string;
  name: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onChange: (filters: ReportFiltersState) => void;
  outlets: OutletOption[];
  canViewAnyOutlet: boolean;
}

export function ReportFilters({
  filters,
  onChange,
  outlets,
  canViewAnyOutlet,
}: ReportFiltersProps) {
  const canExport = useHasPermission('report:export');

  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      onChange({ ...filters, startDate: date });
    },
    [filters, onChange],
  );

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      onChange({ ...filters, endDate: date });
    },
    [filters, onChange],
  );

  const handleOutletChange = useCallback(
    (value: string) => {
      onChange({ ...filters, outletId: value === 'all' ? undefined : value });
    },
    [filters, onChange],
  );

  const handleGranularityChange = useCallback(
    (value: string) => {
      onChange({ ...filters, granularity: value as ReportGranularity });
    },
    [filters, onChange],
  );

  return (
    <Card className="border-border/50 shadow-sm bg-gradient-to-b from-card to-muted/20">
      <CardContent className="flex flex-wrap items-center gap-3 p-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:inline">
            From
          </span>
          <div className="flex items-center gap-1.5 rounded-lg bg-background border border-border/60 px-2.5 py-1.5 shadow-sm">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <DatePicker
              date={filters.startDate}
              onDateChange={handleStartDateChange}
              placeholder="Start date"
              className="h-8 w-[140px] border-0 bg-transparent shadow-none focus-visible:ring-0"
              maxDate={filters.endDate}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:inline">
            To
          </span>
          <div className="flex items-center gap-1.5 rounded-lg bg-background border border-border/60 px-2.5 py-1.5 shadow-sm">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <DatePicker
              date={filters.endDate}
              onDateChange={handleEndDateChange}
              placeholder="End date"
              className="h-8 w-[140px] border-0 bg-transparent shadow-none focus-visible:ring-0"
              minDate={filters.startDate}
            />
          </div>
        </div>

        {/* Outlet Selector */}
        {canViewAnyOutlet && (
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:inline">
              Outlet
            </span>
            <Select
              value={filters.outletId ?? 'all'}
              onValueChange={handleOutletChange}
            >
              <SelectTrigger className="h-9 w-[200px] gap-2 rounded-lg bg-background border-border/60 shadow-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All outlets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outlets</SelectItem>
                {outlets.map((outlet) => (
                  <SelectItem key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Granularity */}
        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:inline">
            View
          </span>
          <Select
            value={filters.granularity}
            onValueChange={handleGranularityChange}
          >
            <SelectTrigger className="h-9 w-[140px] gap-2 rounded-lg bg-background border-border/60 shadow-sm">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Button */}
        <div className="ml-auto">
          <Can permission="report:export">
            <Button
              variant="outline"
              className="h-9 gap-1.5 rounded-lg border-border/60 bg-background shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
              disabled={!canExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </Can>
        </div>
      </CardContent>
    </Card>
  );
}
