'use client';

import { Sun, Sunset, Moon, UtensilsCrossed, Leaf, Drumstick, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { KitchenReportItem } from '@/api/admin-kitchen.api';

interface MealSlotSectionProps {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  operationalHours?: { start_time: string; end_time: string };
  recipes?: KitchenReportItem[];
  corporateCount?: number;
  loading?: boolean;
}

const MEAL_META: Record<
  string,
  { icon: React.ReactNode; tone: string; gradient: string }
> = {
  Breakfast: {
    icon: <Sun className="h-4 w-4" />,
    tone: 'bg-amber-50 text-amber-700 ring-amber-100',
    gradient: 'from-amber-50/60 to-amber-50/20',
  },
  Lunch: {
    icon: <Sunset className="h-4 w-4" />,
    tone: 'bg-orange-50 text-orange-700 ring-orange-100',
    gradient: 'from-orange-50/60 to-orange-50/20',
  },
  Dinner: {
    icon: <Moon className="h-4 w-4" />,
    tone: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    gradient: 'from-indigo-50/60 to-indigo-50/20',
  },
};

export function MealSlotSection({
  mealType,
  operationalHours,
  recipes,
  corporateCount = 0,
  loading,
}: MealSlotSectionProps) {
  const meta = MEAL_META[mealType];
  const directRecipes = recipes || [];
  const directTotal = directRecipes.reduce((sum, r) => sum + (r.total || 0), 0);
  const combinedTotal = directTotal + corporateCount;
  const hasCorporate = corporateCount > 0;
  const hasDirect = directTotal > 0;
  const isEmpty = !hasDirect && !hasCorporate;

  const sortedRecipes = [...directRecipes].sort((a, b) => (b.total || 0) - (a.total || 0));

  if (loading) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        {/* Header Strip */}
        <div
          className={cn(
            'flex items-center justify-between border-b border-border/70 bg-gradient-to-b px-4 py-3',
            meta.gradient,
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1',
                meta.tone,
              )}
            >
              {meta.icon}
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {mealType}
            </h3>
            <span className="text-sm font-bold text-foreground">
              — {combinedTotal}
            </span>
            {operationalHours && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border/50">
                <Clock className="h-2.5 w-2.5" />
                {operationalHours.start_time}–{operationalHours.end_time}
              </span>
            )}
          </div>
          {operationalHours && (
            <span className="sm:hidden inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {operationalHours.start_time}–{operationalHours.end_time}
            </span>
          )}
        </div>

        {/* Order counts breakdown */}
        {!isEmpty && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border/50 bg-muted/20 px-4 py-2 text-xs">
            {hasDirect && (
              <span className="text-muted-foreground">
                Direct orders:{" "}
                <span className="font-semibold text-foreground">{directTotal}</span>
              </span>
            )}
            {hasCorporate && (
              <span className="text-muted-foreground">
                Corporate:{" "}
                <span className="font-semibold text-foreground">{corporateCount}</span>
              </span>
            )}
          </div>
        )}

        {/* Content: recipes, corporate note, or empty state */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                No orders scheduled
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                No {mealType.toLowerCase()} orders for this date.
              </p>
            </div>
          </div>
        ) : sortedRecipes.length > 0 ? (
          <div className="divide-y divide-border/40">
            {sortedRecipes.map((recipe, index) => (
              <div
                key={`${recipe.recipe_name}-${index}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-accent/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {recipe.recipe_name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {recipe.veg_count > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                      <Leaf className="h-3 w-3 text-emerald-600" />
                      {recipe.veg_count}
                    </span>
                  )}
                  {recipe.nonveg_count > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-900 ring-1 ring-rose-100">
                      <Drumstick className="h-3 w-3 text-rose-600" />
                      {recipe.nonveg_count}
                    </span>
                  )}
                  <span className="w-6 text-right text-sm font-bold text-foreground">
                    {recipe.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Corporate recipes configured separately.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
