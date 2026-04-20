'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Shield, Ban, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide',
        status === 'active' && 'bg-[rgba(0,153,15,0.12)] text-[#00990f]',
        status === 'inactive' && 'bg-[rgba(255,0,4,0.12)] text-[#ff0004]',
        status === 'pending' && 'bg-amber-100 text-amber-700',
      )}
    >
      {status === 'active' ? 'ACTIVE' : status === 'inactive' ? 'AWAY' : 'PENDING'}
    </span>
  );
}

function RoleBadge({ role }: { role: AdminUser['role'] }) {
  const labels: Record<string, string> = {
    superAdmin: 'Admin',
    outletAdmin: 'Hub Owner',
    deliveryPartner: 'Delivery',
    customer: 'Customer',
    corporate: 'Corporate',
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{
        backgroundColor: 'rgba(68,21,28,0.08)',
        color: '#44151c',
      }}
    >
      {labels[role] || role}
    </span>
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

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(219,192,193,0.2)' }}>
              {['User', 'Email', 'Role', 'Outlet', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-4 text-left">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(219,192,193,0.15)' }}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="px-6 py-4"><Skeleton className="h-8 w-16 rounded-lg" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="rounded-full bg-[#f8f5f5] p-4 mb-4">
        <Users className="h-6 w-6" style={{ color: '#44151c' }} />
      </div>
      <p className="text-lg font-semibold text-center" style={{ color: '#3d000c' }}>No users found</p>
      <p className="text-sm mt-1 text-center" style={{ color: '#554243' }}>
        Try adjusting your filters or search query
      </p>
    </div>
  );
}

export function UserTable({ users, isLoading = false, onStatusChange }: UserTableProps) {
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

  if (isLoading) return <TableSkeleton />;
  if (users.length === 0) return <EmptyState />;

  return (
    <>
      <div
        className="overflow-hidden rounded-3xl bg-white"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(219,192,193,0.2)' }}>
                {['User', 'Email', 'Role', 'Outlet', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#554243' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user._id}
                  style={{
                    borderBottom:
                      idx < users.length - 1
                        ? '1px solid rgba(219,192,193,0.15)'
                        : 'none',
                  }}
                  className="transition-colors hover:bg-[rgba(68,21,28,0.02)]"
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#44151c' }}
                      >
                        {getUserInitials(user.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#3d000c' }}>
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: '#554243' }}>
                          ID: {user._id.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#554243' }}>
                      {user.email}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Outlet */}
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#554243' }}>
                      {user.assigned_outlet_name || '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Can permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
                        <Link href={`/admin/users/${user._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-[#554243] hover:text-[#44151c] hover:bg-[rgba(68,21,28,0.06)]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </Can>
                      {canChangeStatus && user.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-[#554243] hover:text-[#ff0004] hover:bg-[rgba(255,0,4,0.08)]"
                          onClick={() => setStatusTarget({ user, newStatus: 'inactive' })}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {canChangeStatus && user.status !== 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-[#554243] hover:text-[#00990f] hover:bg-[rgba(0,153,15,0.08)]"
                          onClick={() => setStatusTarget({ user, newStatus: 'active' })}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              onClick={handleStatusConfirm}
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
    </>
  );
}
