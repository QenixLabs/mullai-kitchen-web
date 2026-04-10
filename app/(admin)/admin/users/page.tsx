'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [outletFilter, setOutletFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState<{
    user: AdminUser;
    newStatus: 'active' | 'inactive';
  } | null>(null);

  const queryParams: AdminUserListParams = {
    search: search || undefined,
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const hasActiveFilters =
    search || roleFilter !== 'all' || statusFilter !== 'all' || outletFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setOutletFilter('all');
    setPage(1);
  }, []);

  const showPendingCard = !hasActiveFilters && page === 1 && pendingCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Oversee access, assign roles, and onboard new culinary staff across your network.
          </p>
        </div>

        <Can
          permission={['user:create:admin', 'user:create:hub', 'user:create:delivery']}
          requireAll={false}
        >
          <Link href="/admin/users/create">
            <Button className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Onboard New User
            </Button>
          </Link>
        </Can>
      </div>

      {/* Stats Grid */}
      <UserStatsGrid />

      {/* Filter Strip */}
      <div className="rounded-3xl border border-border/40 bg-card/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-border/60 bg-background"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v as RoleFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[170px] rounded-xl border-border/60 bg-background">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
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
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-border/60 bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-border/60 bg-background">
                  <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
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
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <Card className="rounded-3xl border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Failed to load users
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Something went wrong while fetching the user list.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-3xl border border-border/40 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-xl" />
                  <Skeleton className="h-3 w-1/2 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-xl" />
                <Skeleton className="h-4 w-32 rounded-xl" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="rounded-3xl border-border/40">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No users found
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center ">
              {hasActiveFilters
                ? 'No users match your current filters. Try adjusting your search or filters.'
                : 'Get started by creating your first user.'}
            </p>
            {!hasActiveFilters && (
              <Can
                permission={['user:create:admin', 'user:create:hub', 'user:create:delivery']}
                requireAll={false}
              >
                <Link href="/admin/users/create">
                  <Button size="sm" className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
                  </Button>
                </Link>
              </Can>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {users.length} of {total} staff member{total !== 1 ? 's' : ''}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {users.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onStatusToggle={(u, newStatus) =>
                  setStatusTarget({ user: u, newStatus })
                }
              />
            ))}

            {/* Pending Onboarding Card */}
            {showPendingCard && (
              <button
                onClick={() => {
                  setStatusFilter('pending');
                  setPage(1);
                }}
                className="group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/60 bg-card/40 p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer min-h-[240px]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-white shadow-lg">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Pending Onboarding
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {pendingCount} applicant{pendingCount !== 1 ? 's' : ''} awaiting verification
                </p>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary group-hover:bg-primary/20 transition-colors">
                  Review Pending
                </span>
              </button>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0) {
                        const prev = arr[idx - 1];
                        if (p - prev > 1) {
                          acc.push('ellipsis');
                        }
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(item)}
                          className={cn(
                            'h-8 w-8 p-0 rounded-lg',
                            page === item &&
                              'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm',
                          )}
                        >
                          {item}
                        </Button>
                      ),
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
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
        <AlertDialogContent className="rounded-2xl border-border !max-w-4xl">
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
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={cn(
                'rounded-full',
                !isActivating &&
                  'bg-destructive text-white hover:bg-destructive/90',
              )}
            >
              {isActivating ? 'Activate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
