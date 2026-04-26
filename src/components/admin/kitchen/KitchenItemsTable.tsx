'use client';

import { Sun, Sunset, Moon, UtensilsCrossed, Leaf, Drumstick } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { KitchenReportItem } from '@/api/admin-kitchen.api';

interface KitchenItemsTableProps {
  items?: KitchenReportItem[];
  loading?: boolean;
}

const MEAL_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  breakfast: { icon: Sun, tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
  lunch: { icon: Sunset, tone: 'bg-orange-50 text-orange-700 ring-orange-100' },
  dinner: { icon: Moon, tone: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
};

function MealChip({ type }: { type: string }) {
  const key = type.toLowerCase();
  const meta = MEAL_META[key] || { icon: UtensilsCrossed, tone: 'bg-muted text-muted-foreground ring-border' };
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1',
        meta.tone,
      )}
    >
      <Icon className="h-3 w-3" />
      {key}
    </span>
  );
}

function HeaderStrip({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <UtensilsCrossed className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Recipe Production</h3>
        {count > 0 && (
          <Badge
            variant="secondary"
            className="h-5 border-0 bg-muted px-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
          >
            {count} {count === 1 ? 'recipe' : 'recipes'}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function KitchenItemsTable({ items, loading }: KitchenItemsTableProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} />
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No kitchen items</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different date or outlet to see scheduled recipes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVeg = items.reduce((sum, i) => sum + (i.veg_count || 0), 0);
  const totalNonveg = items.reduce((sum, i) => sum + (i.nonveg_count || 0), 0);
  const grandTotal = items.reduce((sum, i) => sum + (i.total || 0), 0);

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <HeaderStrip count={items.length} />
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/70 bg-background hover:bg-background">
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recipe
              </TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Meal
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Veg
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Non-Veg
              </TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <TableRow
                  key={`${item.recipe_name}-${item.meal_type}-${index}`}
                  className={cn('transition-colors hover:bg-accent/20', !isLast && 'border-b border-border/50')}
                >
                  <TableCell className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{item.recipe_name}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <MealChip type={item.meal_type} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {item.veg_count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-100">
                        <Leaf className="h-3 w-3 text-emerald-600" />
                        {item.veg_count}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    {item.nonveg_count > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-900 ring-1 ring-rose-100">
                        <Drumstick className="h-3 w-3 text-rose-600" />
                        {item.nonveg_count}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-foreground">{item.total}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{items.length}</span> recipe
            {items.length === 1 ? '' : 's'} scheduled
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Leaf className="h-3 w-3 text-emerald-600" />
              <span className="font-semibold text-foreground">{totalVeg}</span> veg
            </span>
            <span className="inline-flex items-center gap-1">
              <Drumstick className="h-3 w-3 text-rose-600" />
              <span className="font-semibold text-foreground">{totalNonveg}</span> non-veg
            </span>
            <span>
              Total <span className="font-semibold text-foreground">{grandTotal}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
