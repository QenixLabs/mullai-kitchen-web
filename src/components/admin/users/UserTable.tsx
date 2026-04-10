'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  Users,
  UserCheck,
  UserX,
  Shield,
  Store,
  Bike,
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
import type { AdminUser } from '@/api/admin-user.api';

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
  onStatusChange?: (user: AdminUser, newStatus: 'active' | 'inactive') => void;
}

function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium',
        status === 'active' &&
          'bg-success/15 text-success hover:bg-success/20',
        status === 'inactive' &&
          'bg-muted text-muted-foreground hover:bg-muted/80',
        status === 'pending' &&
          'bg-warning/15 text-warning hover:bg-warning/20'
      )}
    >
      {status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : 'Pending'}
    </Badge>
  );
}

function RoleBadge({ role }: { role: AdminUser['role'] }) {
  const config: Record<
    AdminUser['role'],
    { label: string; classes: string; icon: React.ReactNode }
  > = {
    superAdmin: {
      label: 'Super Admin',
      classes: 'bg-primary/10 text-primary',
      icon: <Shield className="h-3 w-3" />,
    },
    outletAdmin: {
      label: 'Outlet Admin',
      classes: 'bg-blue-500/10 text-blue-600',
      icon: <Store className="h-3 w-3" />,
    },
    deliveryPartner: {
      label: 'Delivery Partner',
      classes: 'bg-emerald-500/10 text-emerald-600',
      icon: <Bike className="h-3 w-3" />,
    },
    customer: {
      label: 'Customer',
      classes: 'bg-secondary text-secondary-foreground',
      icon: null,
    },
    corporate: {
      label: 'Corporate',
      classes: 'bg-secondary text-secondary-foreground',
      icon: null,
    },
  };

  const { label, classes, icon } = config[role];

  return (
    <Badge variant="secondary" className={cn('font-medium', classes)}>
      {icon}
      {label}
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
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24 rounded-sm" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16 rounded-sm" />
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
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters or search query
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserTable({
  users,
  isLoading = false,
  onStatusChange,
}: UserTableProps) {
  const [statusTarget, setStatusTarget] = useState<{
    user: AdminUser;
    newStatus: 'active' | 'inactive';
  } | null>(null);

  const canChangeStatus = useHasPermission('user:status');

  const handleStatusConfirm = () => {
    if (statusTarget && onStatusChange) {
      onStatusChange(statusTarget.user, statusTarget.newStatus);
    }
    setStatusTarget(null);
  };

  const isActivating = statusTarget?.newStatus === 'active';

  return (
    <>
      <Card className="overflow-hidden border-border shadow-md">
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Name
                  </TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Role
                  </TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Outlet
                  </TableHead>
                  <TableHead className="h-11 px-4 text-sm font-semibold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-11 w-[60px] px-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows />
                ) : users.length === 0 ? (
                  <EmptyState />
                ) : (
                  users.map((user, index) => (
                    <TableRow
                      key={user._id}
                      className={cn(
                        'group border-b-border transition-colors hover:bg-muted/40',
                        index === users.length - 1 && 'border-b-0'
                      )}
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {getUserInitials(user.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {user.assigned_outlet_name ? (
                          <span className="text-sm text-foreground">
                            {user.assigned_outlet_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={user.status} />
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
                              permission={['user:view:any', 'user:view:outlet']}
                              requireAll={false}
                            >
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/users/${user._id}`}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                            </Can>
                            {canChangeStatus && (
                              <>
                                <DropdownMenuSeparator />
                                {user.status !== 'active' ? (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      setStatusTarget({
                                        user,
                                        newStatus: 'active',
                                      })
                                    }
                                  >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() =>
                                      setStatusTarget({
                                        user,
                                        newStatus: 'inactive',
                                      })
                                    }
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
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
        open={!!statusTarget}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-sm border-border !max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              {isActivating ? 'Activate User' : 'Deactivate User'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to{' '}
              {isActivating ? 'activate' : 'deactivate'}{' '}
              <span className="font-semibold text-foreground">
                {statusTarget?.user.name}
              </span>
              ?
              {!isActivating &&
                ' This will restrict their access to the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={cn(
                'rounded-sm',
                !isActivating &&
                  'bg-destructive text-white hover:bg-destructive/90'
              )}
            >
              {isActivating ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
