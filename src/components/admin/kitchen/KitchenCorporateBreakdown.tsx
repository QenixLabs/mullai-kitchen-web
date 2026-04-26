'use client';

import { ChevronDown, Building2, Sun, Sunset, Moon, UtensilsCrossed, Leaf, Drumstick } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { KitchenReportCorporateItem } from '@/api/admin-kitchen.api';

interface KitchenCorporateBreakdownProps {
  items?: KitchenReportCorporateItem[];
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
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize ring-1',
        meta.tone,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {key}
    </span>
  );
}

export function KitchenCorporateBreakdown({ items, loading }: KitchenCorporateBreakdownProps) {
  const orderCount = items?.length ?? 0;

  return (
    <Collapsible defaultOpen={false}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CollapsibleTrigger className="group flex w-full items-center justify-between border-b border-transparent bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3 transition-all hover:from-muted/60 hover:to-muted/20 data-[state=open]:border-border/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-info/15 text-info ring-1 ring-info/20">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">Corporate Breakdown</h3>
            <Badge
              variant="secondary"
              className="h-5 border-0 bg-muted px-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground"
            >
              {orderCount} {orderCount === 1 ? 'order' : 'orders'}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : !items || items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="rounded-full bg-muted p-3 text-muted-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">No corporate orders</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nothing scheduled for this date.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                      <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Order ID
                      </TableHead>
                      <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Company
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
                      <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Meals
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const isLast = index === items.length - 1;
                      const idShort = (item.order_id || item.corporate_order_id || '').toString();
                      return (
                        <TableRow
                          key={`${item.order_id || item.corporate_order_id}-${index}`}
                          className={cn('transition-colors hover:bg-accent/20', !isLast && 'border-b border-border/50')}
                        >
                          <TableCell className="px-4 py-3">
                            <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                              {idShort.length > 10 ? `…${idShort.slice(-6)}` : idShort}
                            </code>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <p className="text-sm font-semibold text-foreground">{item.company_name}</p>
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
                            <span className="text-sm font-bold text-foreground">{item.total_meals}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {item.meal_types.map((type) => (
                                <MealChip key={type} type={type} />
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
                  <span>
                    <span className="font-semibold text-foreground">{items.length}</span> corporate order
                    {items.length === 1 ? '' : 's'}
                  </span>
                  <span className="hidden sm:inline">Click row meal chips to identify slot mix</span>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
