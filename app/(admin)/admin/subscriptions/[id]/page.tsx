'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Pause,
  CalendarX,
  User,
  Utensils,
  MapPin,
  CreditCard,
  CalendarDays,
  RotateCcw,
  ClipboardList,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { useAdminSubscriptionDetail, useAdminPauseSubscription, useAdminResumeSubscription } from '@/api/hooks/useAdminSubscriptions';
import { usePausePeriods } from '@/api/hooks/use-subscription';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';
import { PauseDialog } from '@/components/admin/subscriptions/PauseDialog';
import { SkipDatesDialog } from '@/components/admin/subscriptions/SkipDatesDialog';
import { SubscriptionActivityLog } from '@/components/admin/subscriptions/SubscriptionActivityLog';
import { cn } from '@/lib/utils';

const statusClass: Record<string, string> = {
  [SubscriptionStatus.ACTIVE]: 'bg-success/10 text-success border-success/20',
  [SubscriptionStatus.PAUSED]: 'bg-warning/10 text-warning border-warning/20',
  [SubscriptionStatus.EXPIRED]: 'bg-muted text-muted-foreground border-muted-foreground/20',
  [SubscriptionStatus.CANCELLED]: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: subscription, isLoading } = useAdminSubscriptionDetail(id);
  const pauseSubscription = useAdminPauseSubscription();
  const resumeSubscription = useAdminResumeSubscription();
  const { data: pausePeriodsData } = usePausePeriods(id);
  const activePausePeriod = pausePeriodsData?.pause_periods?.find((p) => p.status === 'ACTIVE');

  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-20 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Subscription not found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          The subscription you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/admin/subscriptions">
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>
        </Button>
      </div>
    );
  }

  const subscriberName =
    typeof subscription.user_id === 'object' && subscription.user_id !== null
      ? subscription.user_id.name || subscription.user_id.email
      : 'Unknown';

  const progressPct = subscription.total_deliveries
    ? Math.round((subscription.completed_deliveries / subscription.total_deliveries) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href="/admin/subscriptions">
            <ArrowLeft className="h-4 w-4" />
            Subscriptions
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {subscriberName}
            </h1>
            <StatusPill className={statusClass[subscription.status]}>
              {subscription.status}
            </StatusPill>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {subscription.plan_name} · {subscription.outlet_name || 'No outlet'}
          </p>
          <div className="mt-3 h-1 w-16 rounded-full bg-gold" />
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Amount</p>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            ₹{subscription.total_amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {subscription.total_deliveries ? (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Delivery Progress</p>
              <p className="text-sm text-muted-foreground">
                {subscription.completed_deliveries} / {subscription.total_deliveries} deliveries
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  progressPct >= 100 ? 'bg-success' : progressPct >= 50 ? 'bg-primary' : 'bg-gold',
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {subscription.remaining_deliveries ?? 0} remaining · {subscription.paused_deliveries}{' '}
              paused
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<User className="h-4 w-4 text-primary" />}
          label="Subscriber"
          value={subscriberName}
        />
        <InfoCard
          icon={<Utensils className="h-4 w-4 text-primary" />}
          label="Plan"
          value={subscription.plan_name}
        />
        <InfoCard
          icon={<MapPin className="h-4 w-4 text-primary" />}
          label="Outlet"
          value={subscription.outlet_name || '-'}
        />
        <InfoCard
          icon={<CreditCard className="h-4 w-4 text-primary" />}
          label="Auto Renew"
          value={subscription.auto_renew ? 'Enabled' : 'Disabled'}
        />
        <InfoCard
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          label="Start Date"
          value={new Date(subscription.start_date).toLocaleDateString('en-IN')}
        />
        <InfoCard
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          label="End Date"
          value={new Date(subscription.end_date).toLocaleDateString('en-IN')}
        />
        <InfoCard
          icon={<ClipboardList className="h-4 w-4 text-primary" />}
          label="Meals"
          value={subscription.meals_included.join(', ')}
        />
        <InfoCard
          icon={<MapPin className="h-4 w-4 text-primary" />}
          label="Address"
          value={subscription.full_address}
        />
      </div>

      {/* Actions */}
      <Can permission="subscription:modify">
        <div className="flex flex-wrap gap-3">
          {subscription.status === SubscriptionStatus.ACTIVE && (
            <>
              <Button variant="outline" onClick={() => setShowPauseDialog(true)}>
                <Pause className="mr-2 h-4 w-4" />
                Pause Subscription
              </Button>
              <Button variant="outline" onClick={() => setShowSkipDialog(true)}>
                <CalendarX className="mr-2 h-4 w-4" />
                Skip Dates
              </Button>
            </>
          )}
          {subscription.status === SubscriptionStatus.PAUSED && (
            <Button
              variant="outline"
              onClick={() => {
                if (!activePausePeriod) return;
                resumeSubscription.mutate({
                  id,
                  data: { pause_period_id: activePausePeriod._id },
                });
              }}
              disabled={resumeSubscription.isPending || !activePausePeriod}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Resume Subscription
            </Button>
          )}
        </div>
      </Can>

      {/* Activity Log */}
      <SubscriptionActivityLog subscriptionId={id} />

      {subscription.status === SubscriptionStatus.ACTIVE && (
        <>
          <PauseDialog
            subscriptionId={id}
            open={showPauseDialog}
            onOpenChange={setShowPauseDialog}
          />
          <SkipDatesDialog
            subscriptionId={id}
            open={showSkipDialog}
            onOpenChange={setShowSkipDialog}
          />
        </>
      )}
    </div>
  );
}

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        className,
      )}
    >
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
            {label}
          </p>
          <div className="text-sm font-medium text-foreground truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
