'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  MapPin,
  Trash2,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import type { Outlet } from '@/api/outlet.api';

interface OutletTableProps {
  outlets: Outlet[];
  isLoading?: boolean;
  onDelete?: (outlet: Outlet) => void;
}

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium',
        status === 'active'
          ? 'bg-success/15 text-success hover:bg-success/20'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}

function TableSkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-sm" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="w-[60px]">
            <Skeleton className="h-8 w-8 rounded-sm" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-[200px]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-sm bg-muted p-3 mb-3">
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No outlets found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters or search query
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function OutletTable({
  outlets,
  isLoading = false,
  onDelete,
}: OutletTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Outlet | null>(null);

  const canDelete = useHasPermission('outlet:delete');

  const handleDeleteConfirm = () => {
    if (deleteTarget && onDelete) {
      onDelete(deleteTarget);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <Card className="overflow-hidden border-border shadow-md">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Outlet Name
                  </TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Location
                  </TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Capacity
                  </TableHead>
                  <TableHead className="h-11 w-[60px] px-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows />
                ) : outlets.length === 0 ? (
                  <EmptyState />
                ) : (
                  outlets.map((outlet, index) => (
                    <TableRow
                      key={outlet._id}
                      className={cn(
                        'group border-b-border transition-colors hover:bg-muted/40',
                        index === outlets.length - 1 && 'border-b-0'
                      )}
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
                            <Store className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {outlet.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {outlet.contact_phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-sm">
                            {outlet.city && outlet.state
                              ? `${outlet.city}, ${outlet.state}`
                              : outlet.address.length > 45
                                ? `${outlet.address.substring(0, 45)}...`
                                : outlet.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={outlet.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {outlet.kitchen_capacity ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="font-medium text-foreground">
                                {outlet.kitchen_capacity}
                              </span>
                              <span className="text-xs">orders/hr</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-sm opacity-70 transition-all duration-200 hover:bg-muted hover:opacity-100 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-sm border-border"
                          >
                            <Can
                              permission={['outlet:edit:any', 'outlet:edit:own']}
                              requireAll={false}
                            >
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/outlets/${outlet._id}`}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  View/Edit
                                </Link>
                              </DropdownMenuItem>
                            </Can>
                            <Can permission="outlet:zones">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/outlets/${outlet._id}/zones`}
                                  className="cursor-pointer"
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
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
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-sm border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Delete Outlet
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone. All associated data including
              delivery zones and operational settings will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-sm bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
