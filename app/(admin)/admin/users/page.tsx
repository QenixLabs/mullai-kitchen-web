'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
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
import { Can } from '@/components/Auth/can';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { useAdminUsers, useUpdateUserStatus } from '@/api/hooks/useAdminUsers';
import { useOutlets } from '@/api/hooks/useOutlets';
import { UserStatsGrid } from '@/components/admin/users/UserStatsGrid';
import { UserTable } from '@/components/admin/users/UserTable';
import { cn } from '@/lib/utils';
import { UserRole } from '@/api/types/user.types';
import type { AdminUser, AdminUserListParams } from '@/api/admin-user.api';

const PAGE_SIZE = 10;

// Mock users for UI preview
const MOCK_USERS: AdminUser[] = [
  {
    _id: 'usr-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91-9876543210',
    role: UserRole.SuperAdmin,
    status: 'active',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-06-10T14:30:00Z',
  },
  {
    _id: 'usr-002',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91-9876543211',
    role: UserRole.OutletAdmin,
    status: 'active',
    assigned_outlet_id: 'out-001',
    assigned_outlet_name: 'Downtown Central',
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-06-12T11:00:00Z',
  },
  {
    _id: 'usr-003',
    name: 'Amit Patel',
    email: 'amit@example.com',
    phone: '+91-9876543212',
    role: UserRole.DeliveryPartner,
    status: 'active',
    assigned_outlet_id: 'out-002',
    assigned_outlet_name: 'Southside Hub',
    vehicle_type: 'Bike',
    vehicle_number: 'TN-01-AB-1234',
    created_at: '2024-03-05T07:30:00Z',
    updated_at: '2024-06-11T16:45:00Z',
  },
  {
    _id: 'usr-004',
    name: 'Sneha Reddy',
    email: 'sneha@example.com',
    phone: '+91-9876543213',
    role: UserRole.Customer,
    status: 'active',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-06-09T09:15:00Z',
  },
  {
    _id: 'usr-005',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91-9876543214',
    role: UserRole.DeliveryPartner,
    status: 'inactive',
    assigned_outlet_id: 'out-001',
    assigned_outlet_name: 'Downtown Central',
    vehicle_type: 'Bike',
    vehicle_number: 'TN-02-CD-5678',
    created_at: '2024-04-12T11:00:00Z',
    updated_at: '2024-06-08T13:20:00Z',
  },
  {
    _id: 'usr-006',
    name: 'Divya Nair',
    email: 'divya@example.com',
    phone: '+91-9876543215',
    role: UserRole.OutletAdmin,
    status: 'active',
    assigned_outlet_id: 'out-003',
    assigned_outlet_name: 'Northern Express',
    created_at: '2024-01-25T08:30:00Z',
    updated_at: '2024-06-10T10:00:00Z',
  },
  {
    _id: 'usr-007',
    name: 'Karthik Iyer',
    email: 'karthik@example.com',
    phone: '+91-9876543216',
    role: UserRole.Customer,
    status: 'pending',
    created_at: '2024-06-15T09:00:00Z',
    updated_at: '2024-06-15T09:00:00Z',
  },
  {
    _id: 'usr-008',
    name: 'Ananya Gupta',
    email: 'ananya@example.com',
    phone: '+91-9876543217',
    role: UserRole.Corporate,
    status: 'active',
    created_at: '2024-05-01T07:00:00Z',
    updated_at: '2024-06-05T15:30:00Z',
  },
];

type RoleFilter = 'all' | AdminUser['role'];
type StatusFilter = 'all' | 'active' | 'inactive' | 'pending';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [outletFilter, setOutletFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
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

  const outlets = outletsData?.data ?? [];
  const users = data?.users?.length ? data.users : MOCK_USERS;
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? MOCK_USERS.length;

  const isActivating = statusTarget?.newStatus === 'active';

  const handleStatusChange = useCallback(
    (user: AdminUser, newStatus: 'active' | 'inactive') => {
      updateStatusMutation.mutate({
        id: user._id,
        data: { status: newStatus },
      });
    },
    [updateStatusMutation],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const hasActiveFilters =
    search || roleFilter !== 'all' || statusFilter !== 'all' || outletFilter !== 'all' || verifiedFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setOutletFilter('all');
    setVerifiedFilter('all');
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="MANAGE USERS"
        subtitle="Track, edit and oversee all registered platform users."
      >
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/80"
            style={{
              borderColor: 'rgba(219,192,193,0.4)',
              color: '#44151c',
              backgroundColor: 'rgba(255,255,255,0.6)',
            }}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export User
          </button>
          <Can
            permission={['user:create:admin', 'user:create:hub', 'user:create:delivery']}
            requireAll={false}
          >
            <Link href="/admin/users/create">
              <Button
                className="rounded-full px-6 text-sm font-semibold text-white shadow-md h-11 transition-colors hover:opacity-90"
                style={{ backgroundColor: '#44151c' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </Link>
          </Can>
        </div>
      </AdminPageHeader>

      {/* Stats Grid */}
      <UserStatsGrid />

      {/* Filter Strip */}
      <div
        className="rounded-3xl border p-4"
        style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#554243]" />
            <Input
              placeholder="Filter by name, ID or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm"
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
              <SelectTrigger className="w-full sm:w-[150px] rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
                <SelectValue placeholder="Role" />
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

            <Can permission="outlet:view:any">
              <Select
                value={outletFilter}
                onValueChange={(v) => {
                  setOutletFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px] rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
                  <SelectValue placeholder="Outlet" />
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

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={verifiedFilter}
              onValueChange={(v) => {
                setVerifiedFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px] rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
                <SelectValue placeholder="Verified" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="rounded-full px-5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#44151c' }}
            >
              Apply Filter
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="rounded-full text-[#554243] hover:text-[#44151c] hover:bg-[rgba(68,21,28,0.06)]"
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
        <Card className="rounded-3xl" style={{ borderColor: 'rgba(219,192,193,0.2)' }}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: '#3d000c' }}>
              Failed to load users
            </h3>
            <p className="text-sm mb-6" style={{ color: '#554243' }}>
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
      ) : (
        <>
          <UserTable
            users={users}
            isLoading={isLoading}
            onStatusChange={(user, newStatus) =>
              setStatusTarget({ user, newStatus })
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm" style={{ color: '#554243' }}>
                Showing {users.length} of {total} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
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
                        <span key={`ellipsis-${idx}`} className="px-1" style={{ color: '#554243' }}>
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(item)}
                          className={cn(
                            'h-8 w-8 p-0 rounded-lg border-[rgba(219,192,193,0.3)]',
                            page === item
                              ? 'bg-gradient-to-r from-[#44151c] to-[#44151c]/80 text-white shadow-sm border-transparent'
                              : 'bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]',
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
                  className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
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
        <AlertDialogContent
          className="rounded-2xl"
          style={{ border: '1px solid rgba(219,192,193,0.2)' }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold" style={{ color: '#3d000c' }}>
              {isActivating ? 'Activate User' : 'Deactivate User'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm" style={{ color: '#554243' }}>
              Are you sure you want to{' '}
              {isActivating ? 'activate' : 'deactivate'}{' '}
              <span className="font-semibold" style={{ color: '#3d000c' }}>
                {statusTarget?.user.name}
              </span>
              ?
              {!isActivating && ' This will restrict their access to the platform.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="rounded-full"
              style={{ borderColor: 'rgba(219,192,193,0.3)', color: '#554243' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statusTarget) handleStatusChange(statusTarget.user, statusTarget.newStatus);
                setStatusTarget(null);
              }}
              className={cn(
                'rounded-full',
                !isActivating
                  ? 'bg-[#ff0004] text-white hover:bg-[#ff0004]/90'
                  : 'bg-[#44151c] text-white hover:bg-[#44151c]/90',
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
