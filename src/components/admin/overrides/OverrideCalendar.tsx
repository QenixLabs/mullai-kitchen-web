'use client';

import { useMemo } from 'react';
import { Sun, Sunset, Moon, X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useOverrideCalendar } from '@/api/hooks/useOverrides';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { MealType } from '@/api/types/menu.types';
import type { MealRosterOverride } from '@/api/types/menu.types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_ORDER: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];

const MEAL_META: Record<MealType, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  [MealType.BREAKFAST]: { icon: Sun, label: 'B' },
  [MealType.LUNCH]: { icon: Sunset, label: 'L' },
  [MealType.DINNER]: { icon: Moon, label: 'D' },
};

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

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean; weekday: number }> = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false, weekday: new Date(prevYear, prevMonth, d).getDay() });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: true, weekday: new Date(year, month, d).getDay() });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false, weekday: new Date(nextYear, nextMonth, d).getDay() });
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
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={`h-${i}`} className="h-7 rounded-md" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10">
            {WEEKDAYS.map((wd, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              return (
                <div
                  key={wd}
                  className={cn(
                    'px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider',
                    isWeekend ? 'text-muted-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {wd}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, idx) => {
              const breakfast = getMealOverride(dayInfo.date, MealType.BREAKFAST);
              const lunch = getMealOverride(dayInfo.date, MealType.LUNCH);
              const dinner = getMealOverride(dayInfo.date, MealType.DINNER);
              const slots = { [MealType.BREAKFAST]: breakfast, [MealType.LUNCH]: lunch, [MealType.DINNER]: dinner };
              const overridesList = [breakfast, lunch, dinner].filter((o): o is MealRosterOverride => !!o);
              const hasAny = overridesList.length > 0;
              const closures = overridesList.filter((o) => o.is_closed).length;
              const specials = overridesList.length - closures;

              const isToday = dayInfo.date === todayStr;
              const isWeekend = dayInfo.weekday === 0 || dayInfo.weekday === 6;
              const isLastInRow = (idx + 1) % 7 === 0;
              const isLastRow = idx >= 35;

              return (
                <div
                  key={idx}
                  className={cn(
                    'group/day relative min-h-[112px] cursor-pointer p-2 transition-all',
                    !isLastInRow && 'border-r border-border/70',
                    !isLastRow && 'border-b border-border/70',
                    !dayInfo.isCurrentMonth && 'bg-muted/20',
                    dayInfo.isCurrentMonth && isWeekend && 'bg-muted/10',
                    isToday && 'bg-primary/[0.04]',
                    closures > 0 && dayInfo.isCurrentMonth && !isToday && 'bg-rose-50/40',
                    specials > 0 && closures === 0 && dayInfo.isCurrentMonth && !isToday && 'bg-amber-50/30',
                    'hover:bg-accent/30 hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]',
                  )}
                  onClick={() => {
                    if (overridesList.length === 1) {
                      const ov = overridesList[0];
                      onDateClick(dayInfo.date, ov.meal_type, ov);
                    } else {
                      onDateClick(dayInfo.date);
                    }
                  }}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex h-6 min-w-[24px] items-center justify-center text-sm font-semibold',
                        isToday && 'rounded-full bg-primary px-1.5 text-primary-foreground',
                        !isToday && dayInfo.isCurrentMonth && 'text-foreground',
                        !dayInfo.isCurrentMonth && 'text-muted-foreground/60',
                      )}
                    >
                      {dayInfo.day}
                    </span>
                    {hasAny && (
                      <div className="flex items-center gap-0.5">
                        {closures > 0 && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                        )}
                        {specials > 0 && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {hasAny ? (
                    <div className="space-y-1">
                      {MEAL_ORDER.map((mt) => {
                        const ov = slots[mt];
                        if (!ov) return null;
                        const Icon = MEAL_META[mt].icon;

                        if (ov.is_closed) {
                          return (
                            <Tooltip key={mt}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 ring-1 ring-rose-100">
                                  <Icon className="h-2.5 w-2.5 shrink-0 text-rose-600" />
                                  <X className="h-2.5 w-2.5 shrink-0 text-rose-600" />
                                  <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                                    {MEAL_META[mt].label} Closed
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs font-medium">{mt} closed</p>
                                {ov.reason && <p className="text-[11px] text-muted-foreground">{ov.reason}</p>}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        const vegName = getRecipeName(ov.veg_recipe_id);
                        const nonvegName = getRecipeName(ov.nonveg_recipe_id);
                        const display = vegName || nonvegName;
                        if (!display) return null;

                        return (
                          <Tooltip key={mt}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 ring-1 ring-amber-100">
                                <Icon className="h-2.5 w-2.5 shrink-0 text-amber-600" />
                                <Sparkles className="h-2.5 w-2.5 shrink-0 text-amber-600" />
                                <span className="truncate text-[10px] font-medium text-amber-900">
                                  {display}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs font-medium">{mt} special</p>
                              {vegName && <p className="text-[11px]">Veg: {vegName}</p>}
                              {nonvegName && <p className="text-[11px]">Non-Veg: {nonvegName}</p>}
                              {ov.reason && <p className="text-[11px] text-muted-foreground">{ov.reason}</p>}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ) : (
                    dayInfo.isCurrentMonth && (
                      <div className="flex h-full items-center justify-center pt-2 opacity-0 transition-opacity group-hover/day:opacity-100">
                        <span className="text-[10px] font-medium text-muted-foreground/70">Click to add</span>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">Legend</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Closure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Special menu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Today
            </span>
            <span className="ml-auto hidden sm:inline">Click any day to add or edit overrides</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
