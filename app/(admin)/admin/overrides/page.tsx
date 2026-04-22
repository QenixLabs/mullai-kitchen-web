'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
<<<<<<< HEAD
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
=======
import { PageHeader } from '@/components/admin/layout/PageHeader';
>>>>>>> 831ebf2 (admin pages ui changes)
import { OutletOverrideSelector } from '@/components/admin/overrides/OutletOverrideSelector';
import { OverrideCalendar } from '@/components/admin/overrides/OverrideCalendar';
import { OverrideList } from '@/components/admin/overrides/OverrideList';
import { OverrideDialog } from '@/components/admin/overrides/OverrideDialog';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';
import { cn } from '@/lib/utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function OverridesPage() {
  const [outletId, setOutletId] = useState('');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState('');
  const [dialogMealType, setDialogMealType] = useState<MealType | undefined>(undefined);
  const [dialogExisting, setDialogExisting] = useState<MealRosterOverride | undefined>(undefined);

  const dateFrom = useMemo(() => `${year}-${String(month + 1).padStart(2, '0')}-01`, [year, month]);
  const dateUntil = useMemo(() => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }, [year, month]);

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
<<<<<<< HEAD
        {/* Header */}
        <AdminPageHeader
          title="Meal Overrides"
          subtitle="Manage date-specific meal overrides, closures, and special menus."
        >
          <Button
            onClick={handleAdd}
            size="sm"
            className="rounded-full text-white px-5 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)',
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Override
          </Button>
        </AdminPageHeader>

        {/* Outlet Selector */}
        <div
          className="rounded-3xl border p-4"
          style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
        >
          <OutletOverrideSelector onOutletChange={setOutletId} />
        </div>

        {/* Month Navigation + Calendar + List */}
        {outletId && (
          <>
            {/* Month Navigation */}
            <div
              className="rounded-3xl border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
            >
=======
        <PageHeader
          title="MEAL OVERRIDES"
          subtitle="Manage date-specific meal overrides, closures, and special menus."
          actions={
            <Button
              onClick={handleAdd}
              className="rounded-full h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Override
            </Button>
          }
        />

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-border/40 shadow-sm p-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <OutletOverrideSelector onOutletChange={setOutletId} />

            {outletId && (
>>>>>>> 831ebf2 (admin pages ui changes)
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
<<<<<<< HEAD
                  className="h-8 w-8 rounded-full"
=======
                  className="h-9 w-9 rounded-lg border-border/40"
>>>>>>> 831ebf2 (admin pages ui changes)
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
<<<<<<< HEAD
                <span
                  className="text-sm font-semibold min-w-[160px] text-center"
                  style={{ color: '#44151c' }}
                >
                  {MONTHS[month]} {year}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
=======
                <div className="flex items-center gap-2 px-3 h-9 bg-muted/40 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground min-w-[120px] text-center">
                    {MONTHS[month]} {year}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-border/40"
>>>>>>> 831ebf2 (admin pages ui changes)
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToday}
                  className="h-9 rounded-lg text-xs font-semibold"
                >
                  Today
                </Button>
              </div>
<<<<<<< HEAD
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="rounded-full"
              >
                Today
              </Button>
            </div>
=======
            )}
          </div>
        </div>
>>>>>>> 831ebf2 (admin pages ui changes)

        {outletId && (
          <>
            {/* Calendar */}
            <div
              className="rounded-3xl bg-white p-6"
              style={{ border: '1px solid rgba(219,192,193,0.2)' }}
            >
              <OverrideCalendar
                outletId={outletId}
                year={year}
                month={month}
                onDateClick={handleDateClick}
              />
            </div>

            {/* Override List */}
<<<<<<< HEAD
            <div className="space-y-3">
              <h2
                className="text-lg font-semibold tracking-tight"
                style={{ color: '#44151c' }}
              >
                Override List
              </h2>
              <div
                className="rounded-3xl bg-white p-6"
                style={{ border: '1px solid rgba(219,192,193,0.2)' }}
              >
                <OverrideList
                  outletId={outletId}
                  dateFrom={dateFrom}
                  dateUntil={dateUntil}
                  onEdit={handleEdit}
                />
              </div>
=======
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Override List
              </h2>
              <OverrideList
                outletId={outletId}
                dateFrom={dateFrom}
                dateUntil={dateUntil}
                onEdit={handleEdit}
              />
>>>>>>> 831ebf2 (admin pages ui changes)
            </div>
          </>
        )}

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
      </div>
    </Can>
  );
}
