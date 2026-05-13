'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarRange,
  CalendarX2,
  CalendarPlus,
  CalendarDays,
  LayoutGrid,
  List,
  CalendarOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Can } from '@/components/Auth/can';
import { OutletOverrideSelector } from '@/components/admin/overrides/OutletOverrideSelector';
import { OverrideCalendar } from '@/components/admin/overrides/OverrideCalendar';
import { OverrideList } from '@/components/admin/overrides/OverrideList';
import { OverrideDialog } from '@/components/admin/overrides/OverrideDialog';
import { useOverrides } from '@/api/hooks/useOverrides';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function OverridesPage() {
  const [outletId, setOutletId] = useState('');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState('');
  const [dialogMealType, setDialogMealType] = useState<MealType | undefined>(undefined);
  const [dialogExisting, setDialogExisting] = useState<MealRosterOverride | undefined>(undefined);

  const dateFrom = useMemo(() => `${year}-${String(month + 1).padStart(2, '0')}-01`, [year, month]);
  const dateUntil = useMemo(() => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }, [year, month]);

  const { data: overridesData } = useOverrides(outletId, { date_from: dateFrom, date_until: dateUntil });

  const stats = useMemo(() => {
    const list = overridesData?.data || [];
    const total = list.length;
    const closures = list.filter((o) => o.is_closed).length;
    const specials = list.filter((o) => !o.is_closed).length;
    const affectedDates = new Set(list.map((o) => o.date?.split('T')[0]).filter(Boolean));
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = list.filter((o) => (o.date?.split('T')[0] || '') >= todayStr).length;
    return { total, closures, specials, affectedDays: affectedDates.size, upcoming };
  }, [overridesData]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
  };

  const handleDateClick = (date: string, mealType?: MealType, existing?: MealRosterOverride) => {
    setDialogDate(date);
    setDialogMealType(mealType);
    setDialogExisting(existing);
    setDialogOpen(true);
  };

  const handleEdit = (override: MealRosterOverride) => {
    setDialogDate(override.date?.split('T')[0] || '');
    setDialogMealType(override.meal_type);
    setDialogExisting(override);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setDialogDate(today);
    setDialogMealType(undefined);
    setDialogExisting(undefined);
    setDialogOpen(true);
  };

  return (
    <Can permission="override:manage">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <CalendarDays className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Meal Overrides</h1>
              <p className="text-sm text-muted-foreground">
                Date-specific changes — closures, holidays, and special menus.
              </p>
            </div>
          </div>
          <Button onClick={handleAdd} size="sm" className="h-9">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Override
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarRange className="h-4 w-4" />}
            label="This Month"
            value={`${stats.total}`}
            sub={stats.total === 0 ? 'No overrides' : 'Total entries'}
            tone="primary"
            disabled={!outletId}
          />
          <StatCard
            icon={<CalendarX2 className="h-4 w-4" />}
            label="Closures"
            value={`${stats.closures}`}
            sub={stats.closures === 0 ? 'All open' : 'Days/meals shut'}
            tone="destructive"
            disabled={!outletId}
          />
          <StatCard
            icon={<CalendarPlus className="h-4 w-4" />}
            label="Special Menus"
            value={`${stats.specials}`}
            sub={stats.specials === 0 ? 'None set' : 'Recipe overrides'}
            tone="accent"
            disabled={!outletId}
          />
          <StatCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Upcoming"
            value={`${stats.upcoming}`}
            sub={`${stats.affectedDays} day${stats.affectedDays === 1 ? '' : 's'} affected`}
            tone="success"
            disabled={!outletId}
          />
        </div>

        {/* Toolbar */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <OutletOverrideSelector onOutletChange={setOutletId} />
            </div>
            {outletId && (
              <>
                <Separator orientation="vertical" className="hidden h-9 lg:block" />
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-lg border border-border/70 bg-background p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handlePrevMonth}
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <button
                      type="button"
                      onClick={handleToday}
                      className="inline-flex h-8 min-w-[160px] items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
                      {MONTHS[month]} {year}
                      {isCurrentMonth && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 border-0 bg-primary/10 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                        >
                          Now
                        </Badge>
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleNextMonth}
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleToday} className="h-9">
                    Today
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* View tabs + content */}
        {outletId ? (
          <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="h-9 p-0.5">
                <TabsTrigger value="calendar" className="h-8 gap-1.5 px-3 text-xs">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="h-8 gap-1.5 px-3 text-xs">
                  <List className="h-3.5 w-3.5" />
                  List
                  {stats.total > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 h-4 border-0 bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground"
                    >
                      {stats.total}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Legend */}
              <div className="hidden items-center gap-3 text-[11px] text-muted-foreground md:flex">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Closed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Special menu
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Today
                </span>
              </div>
            </div>

            <TabsContent value="calendar" className="mt-0">
              <OverrideCalendar
                outletId={outletId}
                year={year}
                month={month}
                onDateClick={handleDateClick}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <OverrideList
                outletId={outletId}
                dateFrom={dateFrom}
                dateUntil={dateUntil}
                onEdit={handleEdit}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <CalendarOff className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Select an outlet to begin</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose an outlet from the toolbar above to manage date-specific overrides.
                </p>
              </div>
              <Skeleton className="mt-2 h-4 w-32" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Override Dialog */}
      {outletId && (
        <OverrideDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          outletId={outletId}
          date={dialogDate}
          mealType={dialogMealType}
          existing={dialogExisting}
        />
      )}
    </Can>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'destructive' | 'accent' | 'success';
  disabled?: boolean;
}

function StatCard({ icon, label, value, sub, tone, disabled }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    accent: 'bg-amber-50 text-amber-600 ring-amber-100',
    success: 'bg-success/15 text-success ring-success/20',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground">
              {disabled ? '—' : value}
            </p>
            {sub && !disabled && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${toneStyles[tone]}`}>
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
