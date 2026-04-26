'use client';

import {
  Eye,
  Truck,
  ShoppingBag,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Can } from '@/components/Auth/can';
import { OrderStatusBadge } from './OrderStatusBadge';
import { cn } from '@/lib/utils';
import type { UnifiedOrder } from '@/api/types/admin-order.types';

interface OrderTableProps {
  data: UnifiedOrder[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

const MEAL_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  breakfast: { icon: Sun, tone: 'bg-amber-50 text-amber-700 ring-amber-100' },
  lunch: { icon: Sunset, tone: 'bg-orange-50 text-orange-700 ring-orange-100' },
  dinner: { icon: Moon, tone: 'bg-indigo-50 text-indigo-700 ring-indigo-100' },
};

function MealChip({ type }: { type?: string }) {
  if (!type) return <span className="text-sm text-muted-foreground">—</span>;
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

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAddress(order: UnifiedOrder): string {
  if (order.full_address) return order.full_address;
  if (order.delivery_address) {
    return `${order.delivery_address.address_line}, ${order.delivery_address.area}`;
  }
  return '';
}

function getItemsDisplay(order: UnifiedOrder): string {
  if (order.recipe_name) return order.recipe_name;
  if (order.items && order.items.length > 0) {
    return order.items.map((item) => `${item.name} x${item.quantity}`).join(', ');
  }
  return '';
}

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <ShoppingBag className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Orders</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

export function OrderTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onViewDetail,
  onUpdateStatus,
}: OrderTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={0} />
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={total ?? 0} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No orders found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting the date, outlet, meal type, or status filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={data.length} total={total} />
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Meal
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Items
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Address
                </TableHead>
                <TableHead className="h-10 w-24 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((order, idx) => {
                const isLast = idx === data.length - 1;
                const items = getItemsDisplay(order);
                const address = getAddress(order);
                return (
                  <TableRow
                    key={order._id}
                    className={cn('transition-colors hover:bg-accent/20', !isLast && 'border-b border-border/50')}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary ring-1 ring-primary/15">
                          {getInitials(order.customer_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {order.customer_name || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <MealChip type={order.meal_type} />
                    </TableCell>
                    <TableCell className="max-w-[220px] px-4 py-3">
                      {items ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="truncate text-sm text-foreground/80">{items}</p>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            <p className="text-xs">{items}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="max-w-[240px] px-4 py-3">
                      {address ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <p className="truncate text-sm text-foreground/80">{address}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            <p className="text-xs">{address}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => onViewDetail(order._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">View details</p>
                          </TooltipContent>
                        </Tooltip>
                        <Can permission="order:deliver">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => onUpdateStatus(order._id, order.status)}
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">Update status</p>
                            </TooltipContent>
                          </Tooltip>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
              <span>
                Page <span className="font-semibold text-foreground">{page}</span> of{' '}
                <span className="font-semibold text-foreground">{totalPages}</span>
                {total !== undefined && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{total}</span> total
                  </>
                )}
              </span>
              <div className="inline-flex items-center rounded-lg border border-border/70 bg-background p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{data.length}</span> order
                {data.length === 1 ? '' : 's'}
                {total !== undefined && total !== data.length && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{total}</span> total
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Click row icons to view or update</span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
