'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useAdminUsers, useUpdateUserStatus, useUserStats } from '@/api/hooks/useAdminUsers';
import { useOutlets } from '@/api/hooks/useOutlets';
import { UserStatsGrid } from '@/components/admin/users/UserStatsGrid';
import { UserCard } from '@/components/admin/users/UserCard';
import { cn } from '@/lib/utils';
import type { AdminUser, AdminUserListParams } from '@/api/admin-user.api';

const PAGE_SIZE = 9;

type RoleFilter = 'all' | AdminUser['role'];
type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [outletFilter, setOutletFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState<{
    user: AdminUser;
    newStatus: 'active' | 'inactive';
  } | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [search]);

  const queryParams: AdminUserListParams = {
    search: debouncedSearch || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    outlet_id: outletFilter === 'all' ? undefined : outletFilter,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useAdminUsers(queryParams);
  const updateStatusMutation = useUpdateUserStatus();
  const { data: outletsData } = useOutlets();
  const { pendingCount } = useUserStats();

  const outlets = outletsData?.data ?? [];
  const users = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const isActivating = statusTarget?.newStatus === 'active';

  const handleStatusConfirm = useCallback(() => {
    if (statusTarget) {
      updateStatusMutation.mutate({
        id: statusTarget.user._id,
        data: { status: statusTarget.newStatus },
      });
    }
    setStatusTarget(null);
  }, [statusTarget, updateStatusMutation]);

  const hasActiveFilters =
    !!debouncedSearch || roleFilter !== 'all' || statusFilter !== 'all' || outletFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setOutletFilter('all');
    setPage(1);
  };

  const showPendingCard = !hasActiveFilters && page === 1 && pendingCount > 0;
  const start = useMemo(() => (page - 1) * PAGE_SIZE + 1, [page]);
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Users className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">
              Oversee access, assign roles, and onboard staff across the network.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <Users className="h-3 w-3" />
            {total} {total === 1 ? 'user' : 'users'}
          </Badge>
          <Can
            permission={['user:create:admin', 'user:create:hub', 'user:create:delivery']}
            requireAll={false}
          >
            <Button size="sm" className="h-9 gap-1.5" asChild>
              <Link href="/admin/users/create">
                <Plus className="h-4 w-4" />
                Onboard User
              </Link>
            </Button>
          </Can>
        </div>
      </div>

      {/* KPI Row */}
      <UserStatsGrid />

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(v) => {
              setRoleFilter(v as RoleFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="superAdmin">Super Admin</SelectItem>
              <SelectItem value="outletAdmin">Hub Owner</SelectItem>
              <SelectItem value="deliveryPartner">Delivery Partner</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Can permission="outlet:view:any">
            <Select
              value={outletFilter}
              onValueChange={(v) => {
                setOutletFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="All Outlets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All outlets</SelectItem>
                {outlets.map((outlet) => (
                  <SelectItem key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Can>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      {isError ? (
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Failed to load users</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong while fetching the user list.
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="h-8">
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/70 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No users found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'No users match your filters. Try adjusting your search or filter selections.'
                  : 'Get started by onboarding your first staff member.'}
              </p>
            </div>
            {!hasActiveFilters && (
              <Can
                permission={['user:create:admin', 'user:create:hub', 'user:create:delivery']}
                requireAll={false}
              >
                <Button size="sm" className="h-8 gap-1.5" asChild>
                  <Link href="/admin/users/create">
                    <Plus className="h-3.5 w-3.5" />
                    Onboard User
                  </Link>
                </Button>
              </Can>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>
              Showing{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {start}–{end}
              </span>{' '}
              of <span className="font-semibold tabular-nums text-foreground">{total}</span>
            </span>
            <span className="hidden sm:inline">
              Page <span className="tabular-nums text-foreground">{page}</span> of{' '}
              <span className="tabular-nums text-foreground">{totalPages}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onStatusToggle={(u, newStatus) =>
                  setStatusTarget({ user: u, newStatus })
                }
              />
            ))}

            {showPendingCard && (
              <button
                onClick={() => {
                  setStatusFilter('pending');
                  setPage(1);
                }}
                className="group flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border/70 bg-card/40 p-6 text-center transition-colors hover:border-warning/40 hover:bg-warning/5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning ring-1 ring-warning/20">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Pending Onboarding</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pendingCount} applicant{pendingCount !== 1 ? 's' : ''} awaiting verification
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning transition-colors group-hover:bg-warning/15">
                  Review Pending
                </span>
              </button>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="flex flex-col items-center justify-between gap-2 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
                <span>
                  Showing <span className="font-semibold tabular-nums text-foreground">{start}–{end}</span>{' '}
                  of <span className="font-semibold tabular-nums text-foreground">{total}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                        onClick={() => setPage(p)}
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Status Change Dialog */}
      <AlertDialog
        open={!!statusTarget}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
      >
        <AlertDialogContent className="min-w-[360px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1',
                  isActivating
                    ? 'bg-success/10 text-success ring-success/20'
                    : 'bg-destructive/10 text-destructive ring-destructive/20',
                )}
              >
                {isActivating ? (
                  <UserCheck className="h-3.5 w-3.5" />
                ) : (
                  <UserX className="h-3.5 w-3.5" />
                )}
              </span>
              {isActivating ? 'Activate User' : 'Deactivate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              You're about to {isActivating ? 'activate' : 'deactivate'}{' '}
              <span className="font-semibold text-foreground">{statusTarget?.user.name}</span>.
              {isActivating
                ? ' They will regain access to the platform immediately.'
                : ' This will restrict their access to the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!isActivating && (
            <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Active sessions, scheduled deliveries, and login tokens will be revoked immediately.
              </span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={cn(
                'h-9 gap-1.5',
                isActivating
                  ? 'bg-success text-success-foreground hover:bg-success/90'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              )}
            >
              {isActivating ? (
                <UserCheck className="h-3.5 w-3.5" />
              ) : (
                <UserX className="h-3.5 w-3.5" />
              )}
              {isActivating ? 'Activate User' : 'Deactivate User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
