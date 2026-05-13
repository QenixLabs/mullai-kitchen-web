'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  TicketPercent,
  Hash,
  CalendarDays,
  Percent,
  IndianRupee,
  Users,
  ShoppingCart,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAdminCoupon, useCouponStats } from '@/api/hooks/useAdminCoupons';
import { CouponForm } from '@/components/admin/coupons/CouponForm';
import { Can } from '@/components/Auth/can';
import type { AdminCoupon } from '@/api/types/admin-coupon.types';

function formatCurrency(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatDate(s: string) {
  return format(new Date(s), 'dd MMM yyyy');
}

const statusTone: Record<string, { container: string; text: string }> = {
  ACTIVE: { container: 'bg-success/10 text-success ring-success/20', text: 'text-success' },
  INACTIVE: { container: 'bg-muted text-muted-foreground ring-border', text: 'text-muted-foreground' },
  EXPIRED: { container: 'bg-rose-50 text-rose-600 ring-rose-100', text: 'text-rose-600' },
};

function StatusPill({ status }: { status: string }) {
  const tone = statusTone[status] ?? statusTone.INACTIVE;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        tone.container,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', tone.text.replace('text-', 'bg-'))} />
      {status.toLowerCase()}
    </span>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/coupons"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Coupons
    </Link>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'muted';
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    info: 'bg-info/15 text-info ring-info/20',
    muted: 'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span
            className={cn(
              'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1',
              toneStyles[tone],
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              {icon}
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          </div>
        </div>
        <div className="space-y-2 px-4 py-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-right text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

function isValidId(value: string) {
  return !!value && value !== 'undefined' && /^[0-9a-fA-F]{24}$/.test(value);
}

export default function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const validId = isValidId(id) ? id : null;
  const { data: coupon, isLoading: couponLoading } = useAdminCoupon(validId);
  const { data: stats, isLoading: statsLoading } = useCouponStats(validId);
  const [editMode, setEditMode] = useState(false);

  const isLoading = couponLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="space-y-6">
        <BackLink />
        <Card className="border-border/70 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Coupon not found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The coupon you are looking for does not exist or has been removed.
              </p>
            </div>
            <Button className="mt-4 gap-1.5" asChild>
              <Link href="/admin/coupons">
                <ChevronLeft className="h-4 w-4" />
                Back to Coupons
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const usageRate = stats?.usage_rate ?? 0;
  const totalDiscount = stats?.total_discount_given ?? 0;
  const remainingUses = Math.max(0, coupon.usage_limit - coupon.usage_count);
  const isExpired = coupon.status === 'EXPIRED';
  const isInactive = coupon.status === 'INACTIVE';

  return (
    <div className="space-y-6">
      <BackLink />

      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold uppercase text-primary ring-1 ring-primary/15">
            <TicketPercent className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
                {coupon.code}
              </h1>
              <StatusPill status={coupon.status} />
              <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                #{coupon._id}
              </code>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                <span className="capitalize">{coupon.type.toLowerCase().replace('_', ' ')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(coupon.valid_from)} – {formatDate(coupon.valid_until)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Can permission="coupon:manage">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? (
                <>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back to Details
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Edit Coupon
                </>
              )}
            </Button>
          </Can>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Usage Rate"
          value={`${(usageRate * 100).toFixed(1)}%`}
          sub={`${coupon.usage_count} of ${coupon.usage_limit} used`}
          tone={usageRate >= 0.8 ? 'success' : usageRate >= 0.5 ? 'warning' : 'muted'}
        />
        <StatCard
          icon={<IndianRupee className="h-4 w-4" />}
          label="Total Discount"
          value={formatCurrency(totalDiscount)}
          sub="Given to customers"
          tone="primary"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Remaining Uses"
          value={remainingUses.toLocaleString('en-IN')}
          sub={remainingUses === 0 ? 'Fully redeemed' : `${coupon.usage_count} redeemed`}
          tone={remainingUses === 0 ? 'destructive' : 'info'}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Validity"
          value={isExpired ? 'Expired' : isInactive ? 'Inactive' : 'Active'}
          sub={`Until ${formatDate(coupon.valid_until)}`}
          tone={isExpired ? 'destructive' : isInactive ? 'warning' : 'success'}
        />
      </div>

      {editMode ? (
        <CouponForm coupon={coupon} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Metadata */}
          <SectionCard
            icon={<TicketPercent className="h-3.5 w-3.5" />}
            title="Coupon Details"
          >
            <Field label="Type">
              <span className="capitalize">{coupon.type.toLowerCase().replace('_', ' ')}</span>
            </Field>
            <Field label="Value">
              <span className="inline-flex items-center gap-1">
                {coupon.type === 'PERCENTAGE' ? (
                  <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {coupon.value}
                {coupon.type === 'PERCENTAGE' && coupon.max_discount !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    (max {formatCurrency(coupon.max_discount)})
                  </span>
                )}
              </span>
            </Field>
            <Field label="Applicability">
              <span className="capitalize">{coupon.applicable_to.toLowerCase().replace('_', ' ')}</span>
            </Field>
            <Field label="Distribution">
              <span className="capitalize">{coupon.distribution_type.toLowerCase().replace('_', ' ')}</span>
            </Field>
            {coupon.min_order_value !== undefined && (
              <Field label="Min Order">{formatCurrency(coupon.min_order_value)}</Field>
            )}
            <Field label="Usage Limit">{coupon.usage_limit.toLocaleString('en-IN')}</Field>
            {coupon.per_user_limit !== undefined && (
              <Field label="Per User Limit">{coupon.per_user_limit.toLocaleString('en-IN')}</Field>
            )}
            <Field label="Valid From">{formatDate(coupon.valid_from)}</Field>
            <Field label="Valid Until">{formatDate(coupon.valid_until)}</Field>
            {coupon.description && (
              <div className="rounded-md bg-muted/30 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm text-foreground">{coupon.description}</p>
              </div>
            )}
          </SectionCard>

          {/* Stats / Usage */}
          <SectionCard
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            title="Usage Statistics"
          >
            <Field label="Times Used">{coupon.usage_count.toLocaleString('en-IN')}</Field>
            <Field label="Usage Limit">{coupon.usage_limit.toLocaleString('en-IN')}</Field>
            <Field label="Remaining">{remainingUses.toLocaleString('en-IN')}</Field>
            <Field label="Usage Rate">{(usageRate * 100).toFixed(1)}%</Field>
            <Field label="Total Discount">{formatCurrency(totalDiscount)}</Field>
            {coupon.assigned_user_ids && coupon.assigned_user_ids.length > 0 && (
              <Field label="Assigned Users">{coupon.assigned_user_ids.length} user(s)</Field>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
