'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { OutletOverrideSelector } from '@/components/admin/overrides/OutletOverrideSelector';
import { OverrideCalendar } from '@/components/admin/overrides/OverrideCalendar';
import { OverrideList } from '@/components/admin/overrides/OverrideList';
import { OverrideDialog } from '@/components/admin/overrides/OverrideDialog';
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meal Overrides</h1>
            <p className="text-sm text-muted-foreground">
              Manage date-specific meal overrides, closures, and special menus.
            </p>
          </div>
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Override
          </Button>
        </div>

        {/* Outlet Selector */}
        <OutletOverrideSelector onOutletChange={setOutletId} />

        {/* Month Navigation */}
        {outletId && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold min-w-[160px] text-center">
                  {MONTHS[month]} {year}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>

            {/* Calendar */}
            <OverrideCalendar
              outletId={outletId}
              year={year}
              month={month}
              onDateClick={handleDateClick}
            />

            {/* Override List */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Override List</h2>
              <OverrideList
                outletId={outletId}
                dateFrom={dateFrom}
                dateUntil={dateUntil}
                onEdit={handleEdit}
              />
            </div>
          </>
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
