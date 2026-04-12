'use client';

import { useMemo } from 'react';
import { Leaf, Drumstick, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOverrideCalendar, useOverrides } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface OverrideCalendarProps {
  outletId: string;
  year: number;
  month: number; // 0-indexed
  onDateClick: (date: string, mealType?: MealType, existing?: MealRosterOverride) => void;
}

export function OverrideCalendar({ outletId, year, month, onDateClick }: OverrideCalendarProps) {
  const dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dateUntil = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data: overridesData, isLoading } = useOverrideCalendar(outletId, dateFrom, dateUntil);
  const { data: recipes } = useRecipeSelect(outletId);

  // Build recipe name lookup
  const recipeNames = useMemo(() => {
    const map = new Map<string, string>();
    (recipes || []).forEach((r) => map.set(r._id, r.name));
    return map;
  }, [recipes]);

  // Build override map keyed by date-mealType
  const overrideMap = useMemo(() => {
    const map = new Map<string, MealRosterOverride>();
    // overridesData could be an array or a record depending on API shape
    const overrides = Array.isArray(overridesData) ? overridesData : [];
    overrides.forEach((o: MealRosterOverride) => {
      const key = `${o.date?.split('T')[0]}-${o.meal_type}`;
      map.set(key, o);
    });
    return map;
  }, [overridesData]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: true });
    }

    // Next month padding
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
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-sm" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardContent className="p-0">
        <div className="grid grid-cols-7">
          {/* Header row */}
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="p-2 text-center text-xs font-semibold text-muted-foreground border-b bg-muted/50">
              {wd}
            </div>
          ))}

          {/* Day cells */}
          {calendarDays.map((dayInfo, idx) => {
            const breakfast = getMealOverride(dayInfo.date, MealType.BREAKFAST);
            const lunch = getMealOverride(dayInfo.date, MealType.LUNCH);
            const dinner = getMealOverride(dayInfo.date, MealType.DINNER);
            const hasAnyOverride = breakfast || lunch || dinner;

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[90px] border-b border-r p-1.5 cursor-pointer transition-colors hover:bg-muted/30 last:border-r-0',
                  !dayInfo.isCurrentMonth && 'opacity-40',
                  hasAnyOverride && 'bg-amber-50/50 dark:bg-amber-950/20',
                )}
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
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'text-xs font-medium',
                    dayInfo.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {dayInfo.day}
                  </span>
                  {hasAnyOverride && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      Override
                    </Badge>
                  )}
                </div>

                <div className="space-y-0.5">
                  {([MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER] as const).map((mt) => {
                    const ov = getMealOverride(dayInfo.date, mt);
                    if (!ov) return null;

                    if (ov.is_closed) {
                      return (
                        <div key={mt} className="flex items-center gap-0.5 text-[10px] text-destructive">
                          <X className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate line-through">{mt.slice(0, 3)}</span>
                        </div>
                      );
                    }

                    const vegName = getRecipeName(ov.veg_recipe_id);
                    const nonvegName = getRecipeName(ov.nonveg_recipe_id);
                    if (!vegName && !nonvegName) return null;

                    return (
                      <div key={mt} className="flex items-center gap-0.5 text-[10px]">
                        {vegName && <Leaf className="h-2.5 w-2.5 text-green-600 shrink-0" />}
                        {nonvegName && <Drumstick className="h-2.5 w-2.5 text-red-500 shrink-0" />}
                        <span className="truncate text-foreground">
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
      </CardContent>
    </Card>
  );
}
