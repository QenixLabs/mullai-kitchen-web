'use client';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KitchenReportCorporateItem } from '@/api/admin-kitchen.api';

interface KitchenCorporateBreakdownProps {
  items?: KitchenReportCorporateItem[];
  loading?: boolean;
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
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', className)}>
      {normalizedType}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  );
}

export function KitchenCorporateBreakdown({ items, loading }: KitchenCorporateBreakdownProps) {
  const orderCount = items?.length ?? 0;

  return (
    <Collapsible defaultOpen={false}>
      <CollapsibleTrigger className="flex items-center justify-between w-full rounded-lg border bg-card p-4 text-card-foreground shadow-sm hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">
            Corporate Breakdown ({orderCount} orders)
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {loading ? (
          <div className="rounded-lg border bg-card p-4">
            <TableSkeleton />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No corporate orders for this date</p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Veg Count</TableHead>
                  <TableHead className="text-right">Non-Veg Count</TableHead>
                  <TableHead className="text-right">Total Meals</TableHead>
                  <TableHead>Meal Types</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={`${item.order_id || item.corporate_order_id}-${index}`}>
                    <TableCell className="font-medium">
                      {item.order_id || item.corporate_order_id}
                    </TableCell>
                    <TableCell>{item.company_name}</TableCell>
                    <TableCell className="text-right">{item.veg_count}</TableCell>
                    <TableCell className="text-right">{item.nonveg_count}</TableCell>
                    <TableCell className="text-right font-medium">{item.total_meals}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.meal_types.map((type) => (
                          <MealTypeBadge key={type} type={type} />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
