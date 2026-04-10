'use client';

import Link from 'next/link';
import {
  Shield,
  Store,
  Bike,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  { label: string; icon: React.ElementType; color: string }
> = {
  [UserRole.SuperAdmin]: { label: 'Super Admin', icon: Shield, color: 'text-primary' },
  [UserRole.OutletAdmin]: { label: 'Hub Owner', icon: Store, color: 'text-blue-600' },
  [UserRole.DeliveryPartner]: { label: 'Delivery Partner', icon: Bike, color: 'text-emerald-600' },
  [UserRole.Customer]: { label: 'Customer', icon: Shield, color: 'text-muted-foreground' },
  [UserRole.Corporate]: { label: 'Corporate', icon: Shield, color: 'text-muted-foreground' },
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

  return (
    <div className="group bg-card rounded-3xl border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center">
              {getUserInitials(user.name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                {user.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full hover:bg-muted opacity-60 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <Can permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user._id}`} className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
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
                      onClick={() => onStatusToggle?.(user, 'active')}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => onStatusToggle?.(user, 'inactive')}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status + Role + Outlet */}
        <div className="mt-3 space-y-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-[11px] font-semibold px-2.5 py-0.5',
              user.status === 'active' && 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20',
              user.status === 'inactive' && 'bg-red-500/15 text-red-600 hover:bg-red-500/20',
              user.status === 'pending' && 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/20',
            )}
          >
            <span
              className={cn(
                'mr-1.5 inline-block h-1.5 w-1.5 rounded-full',
                user.status === 'active' && 'bg-emerald-500',
                user.status === 'inactive' && 'bg-red-500',
                user.status === 'pending' && 'bg-amber-500',
              )}
            />
            {user.status === 'active' ? 'ACTIVE' : user.status === 'inactive' ? 'INACTIVE' : 'PENDING'}
          </Badge>

          <div className="flex items-center gap-2 text-sm">
            <RoleIcon className={cn('h-4 w-4 shrink-0', roleConfig.color)} />
            <span className="text-muted-foreground">{roleConfig.label}</span>
          </div>

          {user.assigned_outlet_name && (
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{user.assigned_outlet_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-border/40" />

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground min-w-0">
          {user.vehicle_number ? (
            <span className="inline-flex items-center gap-1.5 bg-muted/80 px-2 py-1 rounded-lg truncate">
              <Bike className="h-3 w-3 shrink-0" />
              <span className="truncate">{user.vehicle_number}</span>
            </span>
          ) : (
            <span className="opacity-60">ID: {user._id.slice(-8)}</span>
          )}
        </div>
        <Can permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
          <Link href={`/admin/users/${user._id}`} className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-primary hover:text-primary/80 hover:bg-primary/5 px-3"
            >
              View Details
            </Button>
          </Link>
        </Can>
      </div>
    </div>
  );
}
