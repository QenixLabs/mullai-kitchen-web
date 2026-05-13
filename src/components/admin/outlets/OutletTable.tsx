'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  MapPin,
  Trash2,
  Store,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import type { Outlet } from '@/api/outlet.api';

interface OutletTableProps {
  outlets: Outlet[];
  isLoading?: boolean;
  onDelete?: (outlet: Outlet) => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  hasFilters?: boolean;
}

function StatusPill({ status }: { status: 'active' | 'inactive' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Inactive
    </span>
  );
}

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Store className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Outlets</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell className="px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell className="hidden px-4 py-3 md:table-cell">
            <Skeleton className="h-3.5 w-40" />
          </TableCell>
          <TableCell className="hidden px-4 py-3 lg:table-cell">
            <Skeleton className="h-3.5 w-28" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-3.5 w-12" />
          </TableCell>
          <TableCell className="px-4 py-3">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
          <TableCell className="w-16 px-4 py-3 text-right">
            <Skeleton className="ml-auto h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function OutletTable({
  outlets,
  isLoading = false,
  onDelete,
  page,
  totalPages,
  total,
  onPageChange,
  hasFilters,
}: OutletTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Outlet | null>(null);

  const canDelete = useHasPermission('outlet:delete');

  const handleDeleteConfirm = () => {
    if (deleteTarget && onDelete) onDelete(deleteTarget);
    setDeleteTarget(null);
  };

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

  if (!outlets.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={total} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No outlets found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasFilters
                  ? 'No outlets match your filters. Try adjusting your search or status.'
                  : 'Get started by creating your first kitchen outlet.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <TooltipProvider delayDuration={250}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={outlets.length} total={total} />
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                  <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Outlet
                  </TableHead>
                  <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Capacity
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 w-16 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlets.map((outlet, idx) => {
                  const isLast = idx === outlets.length - 1;
                  const locationText =
                    outlet.city && outlet.state
                      ? `${outlet.city}, ${outlet.state}`
                      : outlet.address.length > 45
                        ? `${outlet.address.substring(0, 45)}…`
                        : outlet.address;
                  return (
                    <TableRow
                      key={outlet._id}
                      className={cn(
                        'group transition-colors hover:bg-accent/20',
                        !isLast && 'border-b border-border/50',
                      )}
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary ring-1 ring-primary/15">
                            {getInitials(outlet.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {outlet.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              <code className="rounded bg-muted/60 px-1 py-px font-mono text-[10px] text-muted-foreground">
                                {outlet.pincode}
                              </code>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden px-4 py-3 md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[220px]">{locationText}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden px-4 py-3 lg:table-cell">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{outlet.contact_phone}</span>
                          </div>
                          {outlet.contact_email && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[180px]">
                                    {outlet.contact_email}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{outlet.contact_email}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {outlet.kitchen_capacity ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-xs font-bold tabular-nums text-foreground ring-1 ring-border">
                            {outlet.kitchen_capacity}
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              /hr
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusPill status={outlet.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">More actions</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end" className="w-48">
                            <Can
                              permission={['outlet:edit:any', 'outlet:edit:own']}
                              requireAll={false}
                            >
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/outlets/${outlet._id}`} className="cursor-pointer">
                                  <Pencil className="mr-2 h-3.5 w-3.5" />
                                  View / Edit
                                </Link>
                              </DropdownMenuItem>
                            </Can>
                            <Can permission="outlet:zones">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/outlets/${outlet._id}/zones`}
                                  className="cursor-pointer"
                                >
                                  <Map className="mr-2 h-3.5 w-3.5" />
                                  Manage Zones
                                </Link>
                              </DropdownMenuItem>
                            </Can>
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(outlet)}
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
              <span>
                Showing <span className="font-semibold text-foreground">{start}–{end}</span> of{' '}
                <span className="font-semibold text-foreground">{total}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const near = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
                  if (!near) {
                    if (p === page - 2 || p === page + 2)
                      return (
                        <span key={p} className="px-1 text-xs text-muted-foreground">
                          …
                        </span>
                      );
                    return null;
                  }
                  return (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'outline'}
                      size="icon-sm"
                      onClick={() => onPageChange(p)}
                      className={cn(
                        'text-xs',
                        page === p && 'bg-primary text-primary-foreground hover:bg-primary/90',
                      )}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{outlets.length}</span> outlet
                {outlets.length === 1 ? '' : 's'}
                {total !== undefined && total !== outlets.length && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{total}</span> total
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Use the menu to edit or remove an outlet</span>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="min-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                <Trash2 className="h-3.5 w-3.5" />
              </span>
              Delete Outlet
            </AlertDialogTitle>
            <AlertDialogDescription>
              You're about to delete{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              All associated data including delivery zones, operational hours, and configuration
              will be permanently removed.
            </span>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="h-9 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Outlet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
