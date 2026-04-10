'use client';

import Link from 'next/link';
import { Mail, Phone, Store, Bike, Calendar, AlertCircle } from 'lucide-react';
import { useAdminUser } from '@/api/hooks/useAdminUsers';
import type { AdminUser } from '@/api/admin-user.api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface UserProfileTabProps {
  userId: string;
}

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  superAdmin: 'Super Admin',
  outletAdmin: 'Hub Owner',
  deliveryPartner: 'Delivery Partner',
  customer: 'Customer',
  corporate: 'Corporate',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

function getStatusBadgeClasses(status: AdminUser['status']): string {
  switch (status) {
    case 'active':
      return 'bg-success/15 text-success';
    case 'inactive':
      return 'bg-muted text-muted-foreground';
    case 'pending':
      return 'bg-warning/15 text-warning';
    default:
      return '';
  }
}

function formatStatusLabel(status: AdminUser['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-y-3 items-center">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-2xl" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="rounded-3xl bg-card border border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40 rounded-2xl" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function UserProfileTab({ userId }: UserProfileTabProps) {
  const { data: user, isLoading, isError } = useAdminUser(userId);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-primary">Failed to Load Profile</h2>
        <p className="text-muted-foreground text-center">
          Unable to fetch user profile details. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center">
          {getInitials(user.name)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(getStatusBadgeClasses(user.status))}
            >
              {formatStatusLabel(user.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={Mail} label="Email">
            {user.email}
          </InfoRow>
          <InfoRow icon={Phone} label="Phone">
            {user.phone}
          </InfoRow>
        </CardContent>
      </Card>

      {/* Outlet Assignment Card */}
      {user.assigned_outlet_id && (
        <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Outlet Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow icon={Store} label="Outlet">
              {user.assigned_outlet_name ? (
                <Link
                  href={`/admin/outlets/${user.assigned_outlet_id}`}
                  className="text-primary hover:underline"
                >
                  {user.assigned_outlet_name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Assigned outlet</span>
              )}
            </InfoRow>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Information Card */}
      {user.role === 'deliveryPartner' && (
        <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Bike} label="Vehicle Type">
              {user.vehicle_type || 'Not specified'}
            </InfoRow>
            <InfoRow icon={Bike} label="Vehicle Number">
              {user.vehicle_number || 'Not specified'}
            </InfoRow>
          </CardContent>
        </Card>
      )}

      {/* Account Information Card */}
      <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={Calendar} label="Created">
            {new Date(user.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </InfoRow>
          <InfoRow icon={Calendar} label="Status">
            <Badge
              variant="secondary"
              className={cn(getStatusBadgeClasses(user.status))}
            >
              {formatStatusLabel(user.status)}
            </Badge>
          </InfoRow>
          {user.status === 'inactive' && user.deactivation_reason && (
            <InfoRow icon={AlertCircle} label="Reason">
              {user.deactivation_reason}
            </InfoRow>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
