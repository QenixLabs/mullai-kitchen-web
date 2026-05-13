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
  Building2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Can } from '@/components/Auth/can';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/api/admin-user.api';
import { UserRole } from '@/api/types/user.types';

interface UserCardProps {
  user: AdminUser;
  onStatusToggle?: (user: AdminUser, newStatus: 'active' | 'inactive') => void;
}

type RoleTone = 'primary' | 'info' | 'success' | 'muted';

const ROLE_CONFIG: Record<
  AdminUser['role'],
  { label: string; icon: React.ElementType; tone: RoleTone }
> = {
  [UserRole.SuperAdmin]: { label: 'Super Admin', icon: Shield, tone: 'primary' },
  [UserRole.OutletAdmin]: { label: 'Hub Owner', icon: Store, tone: 'info' },
  [UserRole.DeliveryPartner]: { label: 'Delivery Partner', icon: Bike, tone: 'success' },
  [UserRole.Customer]: { label: 'Customer', icon: Shield, tone: 'muted' },
  [UserRole.Corporate]: { label: 'Corporate', icon: Building2, tone: 'muted' },
};

const ROLE_TONE_STYLES: Record<RoleTone, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/15',
  info: 'bg-info/15 text-info ring-info/20',
  success: 'bg-success/15 text-success ring-success/20',
  muted: 'bg-muted text-muted-foreground ring-border',
};

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StatusPill({ status }: { status: AdminUser['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Inactive
    </span>
  );
}

export function UserCard({ user, onStatusToggle }: UserCardProps) {
  const canChangeStatus = useHasPermission('user:status');
  const roleConfig = ROLE_CONFIG[user.role];
  const RoleIcon = roleConfig.icon;

  return (
    <TooltipProvider delayDuration={250}>
      <Card className="group overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          {/* Header strip */}
          <div className="flex items-start justify-between gap-2 border-b border-border/70 bg-gradient-to-b from-muted/30 to-muted/5 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary ring-1 ring-primary/15">
                {getUserInitials(user.name)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {user.name}
                </h3>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
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
                <Can permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/users/${user._id}`} className="cursor-pointer">
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      View details
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
                        <UserCheck className="mr-2 h-3.5 w-3.5" />
                        Activate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => onStatusToggle?.(user, 'inactive')}
                      >
                        <UserX className="mr-2 h-3.5 w-3.5" />
                        Deactivate
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Body */}
          <div className="space-y-2.5 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <StatusPill status={user.status} />
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1',
                  ROLE_TONE_STYLES[roleConfig.tone],
                )}
              >
                <RoleIcon className="h-3 w-3 shrink-0" />
                {roleConfig.label}
              </span>
            </div>

            {user.assigned_outlet_name && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Store className="h-3 w-3 shrink-0" />
                <span className="truncate">{user.assigned_outlet_name}</span>
              </div>
            )}

            {user.vehicle_number && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bike className="h-3 w-3 shrink-0" />
                <code className="rounded bg-muted/60 px-1 py-px font-mono text-[10px] text-foreground/80">
                  {user.vehicle_number}
                </code>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-border/50 bg-muted/20 px-4 py-2">
            <code className="font-mono text-[10px] text-muted-foreground/80">
              ID: {user._id.slice(-8)}
            </code>
            <Can permission={['user:view:any', 'user:view:outlet']} requireAll={false}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
                asChild
              >
                <Link href={`/admin/users/${user._id}`}>
                  Open
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
