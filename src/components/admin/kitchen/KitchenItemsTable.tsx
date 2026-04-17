'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UtensilsCrossed } from 'lucide-react';
import type { KitchenReportItem } from '@/api/admin-kitchen.api';

interface KitchenItemsTableProps {
  items?: KitchenReportItem[];
  loading?: boolean;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  );
}

function MealTypeBadge({ type }: { type: string }) {
  const normalizedType = type.toLowerCase();
  const styles: Record<string, string> = {
    breakfast: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    lunch: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    dinner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const className = styles[normalizedType] ?? 'bg-muted text-muted-foreground';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}>
      {normalizedType}
    </span>
  );
}

export function KitchenItemsTable({ items, loading }: KitchenItemsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Kitchen Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Kitchen Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No kitchen items found for the selected date.</p>
            <p className="text-xs text-muted-foreground mt-1">Try selecting a different date or outlet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipe Name</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead className="text-right">Veg</TableHead>
                <TableHead className="text-right">Non-Veg</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item.recipe_name}-${item.meal_type}-${index}`}>
                  <TableCell className="font-medium">{item.recipe_name}</TableCell>
                  <TableCell>
                    <MealTypeBadge type={item.meal_type} />
                  </TableCell>
                  <TableCell className="text-right">{item.veg_count}</TableCell>
                  <TableCell className="text-right">{item.nonveg_count}</TableCell>
                  <TableCell className="text-right font-medium">{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
