'use client';

import { useMemo } from 'react';
<<<<<<< HEAD
import { Leaf, Drumstick, X } from 'lucide-react';
=======
import { Leaf, Drumstick, X, CalendarX } from 'lucide-react';
>>>>>>> 831ebf2 (admin pages ui changes)
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useOverrideCalendar } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface OverrideCalendarProps {
  outletId: string;
  year: number;
  month: number;
  onDateClick: (date: string, mealType?: MealType, existing?: MealRosterOverride) => void;
}

export function OverrideCalendar({ outletId, year, month, onDateClick }: OverrideCalendarProps) {
  const dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dateUntil = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data: overridesData, isLoading } = useOverrideCalendar(outletId, dateFrom, dateUntil);
  const { data: recipes } = useRecipeSelect(outletId);

  const recipeNames = useMemo(() => {
    const map = new Map<string, string>();
    (recipes || []).forEach((r) => map.set(r._id, r.name));
    return map;
  }, [recipes]);

  const overrideMap = useMemo(() => {
    const map = new Map<string, MealRosterOverride>();
    const overrides = Array.isArray(overridesData) ? overridesData : [];
    overrides.forEach((o: MealRosterOverride) => {
      const key = `${o.date?.split('T')[0]}-${o.meal_type}`;
      map.set(key, o);
    });
    return map;
  }, [overridesData]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getRecipeName = (id?: string) => {
    if (!id) return null;
    return recipeNames.get(id) || id;
  };

  const getMealOverride = (date: string, mealType: MealType) => {
    return overrideMap.get(`${date}-${mealType}`);
  };

  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="rounded-3xl bg-white p-4" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
=======
      <div className="bg-white rounded-xl border border-border/40 shadow-sm p-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
>>>>>>> 831ebf2 (admin pages ui changes)
          ))}
        </div>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="rounded-3xl bg-white overflow-hidden" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
      <div className="grid grid-cols-7">
        {/* Header row */}
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-3 text-center text-[11px] font-bold uppercase tracking-wider"
            style={{
              color: '#554243',
              borderBottom: '1px solid rgba(219,192,193,0.2)',
              backgroundColor: 'rgba(68,21,28,0.03)',
            }}
=======
    <div className="bg-white rounded-xl border border-border/40 shadow-sm overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/30">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="p-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/30"
>>>>>>> 831ebf2 (admin pages ui changes)
          >
            {wd}
          </div>
        ))}
<<<<<<< HEAD

        {/* Day cells */}
=======
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
>>>>>>> 831ebf2 (admin pages ui changes)
        {calendarDays.map((dayInfo, idx) => {
          const breakfast = getMealOverride(dayInfo.date, MealType.BREAKFAST);
          const lunch = getMealOverride(dayInfo.date, MealType.LUNCH);
          const dinner = getMealOverride(dayInfo.date, MealType.DINNER);
          const hasAnyOverride = breakfast || lunch || dinner;
<<<<<<< HEAD
          const isToday = dayInfo.isCurrentMonth && dayInfo.date === new Date().toISOString().split('T')[0];
=======
>>>>>>> 831ebf2 (admin pages ui changes)

          return (
            <div
              key={idx}
              className={cn(
<<<<<<< HEAD
                'min-h-[80px] sm:min-h-[100px] border-b border-r p-1.5 sm:p-2 cursor-pointer transition-colors hover:bg-[rgba(68,21,28,0.03)] last:border-r-0',
                !dayInfo.isCurrentMonth && 'opacity-30',
                hasAnyOverride && 'bg-[rgba(68,21,28,0.02)]',
              )}
              style={{ borderColor: 'rgba(219,192,193,0.15)' }}
=======
                'min-h-[100px] border-b border-r p-2 cursor-pointer transition-colors hover:bg-muted/20 last:border-r-0',
                !dayInfo.isCurrentMonth && 'bg-muted/10',
                hasAnyOverride && 'bg-primary/[0.02]'
              )}
>>>>>>> 831ebf2 (admin pages ui changes)
              onClick={() => {
                const overrides = [breakfast, lunch, dinner].filter((o): o is MealRosterOverride => !!o);
                if (overrides.length === 1) {
                  const ov = overrides[0];
                  onDateClick(dayInfo.date, ov.meal_type, ov);
                } else {
                  onDateClick(dayInfo.date);
                }
              }}
            >
<<<<<<< HEAD
=======
              {/* Day number */}
>>>>>>> 831ebf2 (admin pages ui changes)
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full',
<<<<<<< HEAD
                    isToday
                      ? 'text-white'
                      : dayInfo.isCurrentMonth
                        ? 'text-[#3d000c]'
                        : 'text-[#554243]',
                  )}
                  style={isToday ? { backgroundColor: '#44151c' } : {}}
=======
                    dayInfo.isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                    hasAnyOverride && dayInfo.isCurrentMonth && 'bg-primary text-primary-foreground'
                  )}
>>>>>>> 831ebf2 (admin pages ui changes)
                >
                  {dayInfo.day}
                </span>
                {hasAnyOverride && (
<<<<<<< HEAD
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(68,21,28,0.08)',
                      color: '#44151c',
                    }}
                  >
                    {([breakfast, lunch, dinner].filter(Boolean).length)} override
=======
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Override
>>>>>>> 831ebf2 (admin pages ui changes)
                  </span>
                )}
              </div>

<<<<<<< HEAD
=======
              {/* Meal overrides */}
>>>>>>> 831ebf2 (admin pages ui changes)
              <div className="space-y-1">
                {([MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER] as const).map((mt) => {
                  const ov = getMealOverride(dayInfo.date, mt);
                  if (!ov) return null;

                  if (ov.is_closed) {
                    return (
<<<<<<< HEAD
                      <div key={mt} className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#ff0004' }}>
                        <X className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate line-through">{mt.slice(0, 3)}</span>
=======
                      <div
                        key={mt}
                        className="flex items-center gap-1 text-[10px] text-destructive bg-destructive/5 rounded px-1.5 py-0.5"
                      >
                        <CalendarX className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate font-medium">{mt.slice(0, 3)} Closed</span>
>>>>>>> 831ebf2 (admin pages ui changes)
                      </div>
                    );
                  }

                  const vegName = getRecipeName(ov.veg_recipe_id);
                  const nonvegName = getRecipeName(ov.nonveg_recipe_id);
                  if (!vegName && !nonvegName) return null;

                  return (
<<<<<<< HEAD
                    <div key={mt} className="flex items-center gap-1 text-[10px]">
                      {vegName && <Leaf className="h-2.5 w-2.5 text-[#00990f] shrink-0" />}
                      {nonvegName && <Drumstick className="h-2.5 w-2.5 text-[#ff0004] shrink-0" />}
                      <span className="truncate font-medium" style={{ color: '#44151c' }}>
=======
                    <div
                      key={mt}
                      className="flex items-center gap-1 text-[10px] bg-muted/30 rounded px-1.5 py-0.5"
                    >
                      {vegName && <Leaf className="h-2.5 w-2.5 text-success shrink-0" />}
                      {nonvegName && <Drumstick className="h-2.5 w-2.5 text-primary shrink-0" />}
                      <span className="truncate text-foreground font-medium">
>>>>>>> 831ebf2 (admin pages ui changes)
                        {vegName || nonvegName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
