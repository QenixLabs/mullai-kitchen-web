'use client';

import Link from 'next/link';
import {
  Shield,
  Store,
  Bike,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/api/admin-user.api';
import { UserRole } from '@/api/types/user.types';

interface UserCardProps {
  user: AdminUser;
  onStatusToggle?: (user: AdminUser, newStatus: 'active' | 'inactive') => void;
}

const ROLE_CONFIG: Record<
  AdminUser['role'],
  { label: string; icon: React.ElementType }
> = {
  [UserRole.SuperAdmin]: { label: 'Super Admin', icon: Shield },
  [UserRole.OutletAdmin]: { label: 'Hub Owner', icon: Store },
  [UserRole.DeliveryPartner]: { label: 'Delivery Partner', icon: Bike },
  [UserRole.Customer]: { label: 'Customer', icon: Shield },
  [UserRole.Corporate]: { label: 'Corporate', icon: Shield },
};

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserCard({ user, onStatusToggle }: UserCardProps) {
  const canChangeStatus = useHasPermission('user:status');
  const roleConfig = ROLE_CONFIG[user.role];
  const RoleIcon = roleConfig.icon;

  const statusLabel = user.status === 'active' ? 'ACTIVE' : user.status === 'inactive' ? 'AWAY' : 'PENDING';

  return (
    <div className="group bg-white rounded-3xl border border-[rgba(219,192,193,0.2)] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 shrink-0 rounded-full border border-[rgba(219,192,193,0.3)] bg-[#f8f5f5] text-[#44151c] font-bold text-sm flex items-center justify-center">
              {getUserInitials(user.name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#3d000c] truncate text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
                {user.name}
              </h3>
              <p className="text-xs text-[#554243] truncate">ID: {user._id.slice(-8)}</p>
            </div>
          </div>

          <Badge
            variant="secondary"
            className={cn(
              'text-[11px] font-bold px-2.5 py-0.5 rounded-full border-0',
              user.status === 'active' && 'bg-[rgba(0,153,15,0.22)] text-[#00990f] hover:bg-[rgba(0,153,15,0.22)]',
              user.status === 'inactive' && 'bg-[rgba(255,0,4,0.17)] text-[#ff0004] hover:bg-[rgba(255,0,4,0.17)]',
              user.status === 'pending' && 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/20',
            )}
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Role + Location */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <RoleIcon className="h-4 w-4 shrink-0 text-[#554243]" />
            <span className="text-[#554243]">{roleConfig.label}</span>
          </div>

          {user.assigned_outlet_name ? (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-[#554243]" />
              <span className="text-[#554243] truncate">{user.assigned_outlet_name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-[#554243]" />
              <span className="text-[#554243]/60">—</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[rgba(219,192,193,0.2)]" />

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between gap-2">
        <div className="text-xs text-[#554243] min-w-0">
          {user.vehicle_number ? (
            <span className="inline-flex items-center gap-1.5 bg-[#f8f5f5] px-2.5 py-1 rounded-full truncate text-[11px] font-semibold">
              <Bike className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.vehicle_number}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-[#f8f5f5] px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#554243]">
              0 Deliveries
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Can permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
            <Link href={`/admin/users/${user._id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-[#554243] hover:text-[#44151c] hover:bg-[rgba(68,21,28,0.06)]"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </Link>
          </Can>
          {canChangeStatus && user.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-[#554243] hover:text-[#ff0004] hover:bg-[rgba(255,0,4,0.08)]"
              onClick={() => onStatusToggle?.(user, 'inactive')}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Deactivate</span>
            </Button>
          )}
          {canChangeStatus && user.status !== 'active' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-[#554243] hover:text-[#00990f] hover:bg-[rgba(0,153,15,0.08)]"
              onClick={() => onStatusToggle?.(user, 'active')}
            >
              <Shield className="h-4 w-4" />
              <span className="sr-only">Activate</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
