'use client';

import { Plus, Leaf, Drumstick, Sun, Sunset, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useWeeklyGrid } from '@/api/hooks/useTemplates';
import { useRecipeSelect } from '@/api/hooks/useRecipes';
import { WeekDay, MealType } from '@/api/types/menu.types';
import type { WeeklyMealTemplate } from '@/api/types/menu.types';

const DAYS: WeekDay[] = [
  WeekDay.MONDAY, WeekDay.TUESDAY, WeekDay.WEDNESDAY,
  WeekDay.THURSDAY, WeekDay.FRIDAY, WeekDay.SATURDAY, WeekDay.SUNDAY,
];
const MEALS: MealType[] = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER];

const DAY_SHORT: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: 'Mon', [WeekDay.TUESDAY]: 'Tue', [WeekDay.WEDNESDAY]: 'Wed',
  [WeekDay.THURSDAY]: 'Thu', [WeekDay.FRIDAY]: 'Fri', [WeekDay.SATURDAY]: 'Sat', [WeekDay.SUNDAY]: 'Sun',
};

const DAY_INDEX: Record<WeekDay, number> = {
  [WeekDay.MONDAY]: 0, [WeekDay.TUESDAY]: 1, [WeekDay.WEDNESDAY]: 2,
  [WeekDay.THURSDAY]: 3, [WeekDay.FRIDAY]: 4, [WeekDay.SATURDAY]: 5, [WeekDay.SUNDAY]: 6,
};

const MEAL_META: Record<MealType, { icon: React.ComponentType<{ className?: string }>; time: string; iconBg: string }> = {
  [MealType.BREAKFAST]: { icon: Sun, time: '7–9 AM', iconBg: 'bg-amber-50 text-amber-600 ring-amber-100' },
  [MealType.LUNCH]: { icon: Sunset, time: '12–2 PM', iconBg: 'bg-orange-50 text-orange-600 ring-orange-100' },
  [MealType.DINNER]: { icon: Moon, time: '7–9 PM', iconBg: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
};

interface WeeklyGridProps {
  outletId: string;
  effectiveFrom: string;
  currentMonday: Date;
  onEdit: (day: WeekDay, mealType: MealType, existing?: WeeklyMealTemplate) => void;
}

export function WeeklyGrid({ outletId, effectiveFrom, currentMonday, onEdit }: WeeklyGridProps) {
  const { data: templates, isLoading: templatesLoading } = useWeeklyGrid(outletId, effectiveFrom);
  const { data: recipes } = useRecipeSelect(outletId);

  const recipeNames = new Map<string, string>();
  (recipes || []).forEach((r) => recipeNames.set(r._id, r.name));

  const templateMap = new Map<string, WeeklyMealTemplate>();
  (templates || []).forEach((t) => {
    templateMap.set(`${t.day_of_week}-${t.meal_type}`, t);
  });

  const getRecipeName = (id?: string) => {
    if (!id) return null;
    return recipeNames.get(id) || id;
  };

  // Compute today index relative to currentMonday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDayIdx = (() => {
    const diff = Math.round((today.getTime() - currentMonday.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < 7 ? diff : -1;
  })();

  // Build day labels with date numbers
  const dayLabels = DAYS.map((d) => {
    const date = new Date(currentMonday);
    date.setDate(currentMonday.getDate() + DAY_INDEX[d]);
    return {
      day: d,
      short: DAY_SHORT[d],
      dateNum: date.getDate(),
      isToday: DAY_INDEX[d] === todayDayIdx,
      isWeekend: d === WeekDay.SATURDAY || d === WeekDay.SUNDAY,
    };
  });

  if (templatesLoading) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-8 gap-2">
            {[...Array(32)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10">
                  <th className="sticky left-0 z-10 w-44 border-r border-border/70 bg-muted/40 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Meal Slot
                  </th>
                  {dayLabels.map(({ day, short, dateNum, isToday, isWeekend }) => (
                    <th
                      key={day}
                      className={cn(
                        'min-w-[140px] border-r border-border/70 px-3 py-3 text-center last:border-r-0',
                        isWeekend && 'bg-muted/30',
                        isToday && 'bg-primary/5',
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={cn(
                            'text-[11px] font-semibold uppercase tracking-wider',
                            isToday ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {short}
                        </span>
                        <span
                          className={cn(
                            'text-base font-bold leading-none',
                            isToday
                              ? 'flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground'
                              : 'text-foreground',
                          )}
                        >
                          {dateNum}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEALS.map((meal) => {
                  const meta = MEAL_META[meal];
                  const Icon = meta.icon;
                  return (
                    <tr key={meal} className="border-b border-border/70 last:border-b-0">
                      <td className="sticky left-0 z-10 w-44 border-r border-border/70 bg-muted/30 px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
                              meta.iconBg,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight text-foreground">{meal}</p>
                            <p className="text-[11px] text-muted-foreground">{meta.time}</p>
                          </div>
                        </div>
                      </td>
                      {dayLabels.map(({ day, isToday, isWeekend }) => {
                        const key = `${day}-${meal}`;
                        const template = templateMap.get(key);
                        const vegName = getRecipeName(template?.veg_recipe_id);
                        const nonvegName = getRecipeName(template?.nonveg_recipe_id);
                        const hasContent = template && (vegName || nonvegName);

                        return (
                          <td
                            key={key}
                            className={cn(
                              'h-[88px] min-w-[140px] cursor-pointer border-r border-border/70 p-2 align-top transition-colors last:border-r-0',
                              isWeekend && 'bg-muted/20',
                              isToday && 'bg-primary/[0.03]',
                              'hover:bg-accent/20 hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]',
                              template?.is_published && 'bg-success/[0.06]',
                            )}
                            onClick={() => onEdit(day, meal, template)}
                          >
                            {hasContent ? (
                              <div className="flex h-full flex-col gap-1.5">
                                {template?.is_published ? (
                                  <Badge
                                    variant="secondary"
                                    className="h-4 w-fit gap-1 border-0 bg-success/15 px-1.5 text-[9px] font-semibold uppercase tracking-wider text-success"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-success" />
                                    Live
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="h-4 w-fit border-0 bg-muted px-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground"
                                  >
                                    Draft
                                  </Badge>
                                )}
                                <div className="space-y-1">
                                  {vegName && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-1.5 py-1 ring-1 ring-emerald-100">
                                          <Leaf className="h-3 w-3 shrink-0 text-emerald-600" />
                                          <span className="truncate text-[11px] font-medium text-emerald-900">{vegName}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">Veg: {vegName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {nonvegName && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 rounded-md bg-rose-50 px-1.5 py-1 ring-1 ring-rose-100">
                                          <Drumstick className="h-3 w-3 shrink-0 text-rose-600" />
                                          <span className="truncate text-[11px] font-medium text-rose-900">{nonvegName}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        <p className="text-xs">Non-Veg: {nonvegName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex h-full min-h-[68px] items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 rounded-md border border-dashed border-border/70 bg-background/50 px-2 text-[11px] font-medium text-muted-foreground/70 transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(day, meal);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add meal
                                </Button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">Legend</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Published / Live
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              Draft (saved, not live)
            </span>
            <span className="flex items-center gap-1.5">
              <Leaf className="h-3 w-3 text-emerald-600" />
              Veg
            </span>
            <span className="flex items-center gap-1.5">
              <Drumstick className="h-3 w-3 text-rose-600" />
              Non-Veg
            </span>
            <span className="ml-auto hidden sm:inline">Click any cell to edit · Hover empty cells to add</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
