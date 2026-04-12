'use client';

import { Plus, Leaf, Drumstick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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

interface WeeklyGridProps {
  outletId: string;
  effectiveFrom: string;
  onEdit: (day: WeekDay, mealType: MealType, existing?: WeeklyMealTemplate) => void;
}

export function WeeklyGrid({ outletId, effectiveFrom, onEdit }: WeeklyGridProps) {
  const { data: templates, isLoading: templatesLoading } = useWeeklyGrid(outletId, effectiveFrom);
  const { data: recipes } = useRecipeSelect(outletId);

  // Build recipe name lookup
  const recipeNames = new Map<string, string>();
  (recipes || []).forEach((r) => recipeNames.set(r._id, r.name));

  // Organize templates by day+meal
  const templateMap = new Map<string, WeeklyMealTemplate>();
  (templates || []).forEach((t) => {
    templateMap.set(`${t.day_of_week}-${t.meal_type}`, t);
  });

  const getRecipeName = (id?: string) => {
    if (!id) return null;
    return recipeNames.get(id) || id;
  };

  if (templatesLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-8 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-sm" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border shadow-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-sm font-semibold text-foreground text-left w-24 border-r">
                  Meal
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="p-3 text-sm font-semibold text-foreground text-center border-r last:border-r-0">
                    {DAY_SHORT[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEALS.map((meal) => (
                <tr key={meal} className="border-b last:border-b-0">
                  <td className="p-3 text-sm font-medium text-foreground border-r bg-muted/30 align-top">
                    {meal}
                  </td>
                  {DAYS.map((day) => {
                    const key = `${day}-${meal}`;
                    const template = templateMap.get(key);
                    const vegName = getRecipeName(template?.veg_recipe_id);
                    const nonvegName = getRecipeName(template?.nonveg_recipe_id);
                    const hasContent = template && (vegName || nonvegName);

                    return (
                      <td
                        key={key}
                        className={cn(
                          'p-2 border-r last:border-r-0 align-top cursor-pointer transition-colors hover:bg-muted/40 min-h-[80px]',
                          template?.is_published && 'bg-success/5',
                        )}
                        onClick={() => onEdit(day, meal, template)}
                      >
                        {hasContent ? (
                          <div className="space-y-1.5">
                            {template?.is_published && (
                              <div className="flex justify-end">
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-success/15 text-success">
                                  Live
                                </Badge>
                              </div>
                            )}
                            {vegName && (
                              <div className="flex items-center gap-1 text-xs">
                                <Leaf className="h-3 w-3 text-green-600 shrink-0" />
                                <span className="truncate text-foreground" title={vegName}>{vegName}</span>
                              </div>
                            )}
                            {nonvegName && (
                              <div className="flex items-center gap-1 text-xs">
                                <Drumstick className="h-3 w-3 text-red-500 shrink-0" />
                                <span className="truncate text-foreground" title={nonvegName}>{nonvegName}</span>
                              </div>
                            )}
                            {!vegName && !nonvegName && (
                              <span className="text-xs text-muted-foreground">Empty</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[60px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(day, meal);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
