'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pause, Play, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/Auth/can';
import {
  useAdminSubscriptionDetail,
  useAdminPauseSubscription,
  useAdminResumeSubscription,
} from '@/api/hooks/useAdminSubscriptions';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';
import { PauseDialog } from '@/components/admin/subscriptions/PauseDialog';
import { SkipDatesDialog } from '@/components/admin/subscriptions/SkipDatesDialog';
import { SubscriptionActivityLog } from '@/components/admin/subscriptions/SubscriptionActivityLog';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [SubscriptionStatus.ACTIVE]: 'default',
  [SubscriptionStatus.PAUSED]: 'secondary',
  [SubscriptionStatus.EXPIRED]: 'outline',
  [SubscriptionStatus.CANCELLED]: 'destructive',
};

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: subscription, isLoading } = useAdminSubscriptionDetail(id);
  const pauseSubscription = useAdminPauseSubscription();
  const resumeSubscription = useAdminResumeSubscription();
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  if (isLoading) return <div className="flex justify-center py-8 text-muted-foreground">Loading subscription...</div>;
  if (!subscription) return <div className="flex justify-center py-8 text-muted-foreground">Subscription not found</div>;

  const subscriberName = typeof subscription.user_id === 'object' && subscription.user_id !== null
    ? (subscription.user_id.name || subscription.user_id.email)
    : 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/subscriptions"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription Details</h1>
          <p className="text-sm text-muted-foreground">{subscriberName} - {subscription.plan_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Info</CardTitle>
            <Badge variant={statusVariant[subscription.status] || 'secondary'}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground">Plan:</span> <span className="font-medium ml-1">{subscription.plan_name}</span></div>
            <div><span className="text-muted-foreground">Outlet:</span> <span className="font-medium ml-1">{subscription.outlet_name}</span></div>
            <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium ml-1">₹{subscription.total_amount.toLocaleString()}</span></div>
            <div><span className="text-muted-foreground">Auto Renew:</span> <span className="font-medium ml-1">{subscription.auto_renew ? 'Yes' : 'No'}</span></div>
            <div><span className="text-muted-foreground">Start:</span> <span className="font-medium ml-1">{new Date(subscription.start_date).toLocaleDateString()}</span></div>
            <div><span className="text-muted-foreground">End:</span> <span className="font-medium ml-1">{new Date(subscription.end_date).toLocaleDateString()}</span></div>
            <div><span className="text-muted-foreground">Completed:</span> <span className="font-medium ml-1">{subscription.completed_deliveries}/{subscription.total_deliveries || '-'}</span></div>
            <div><span className="text-muted-foreground">Paused:</span> <span className="font-medium ml-1">{subscription.paused_deliveries}</span></div>
          </div>
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Address:</span> <span className="font-medium ml-1">{subscription.full_address}</span>
          </div>
        </CardContent>
      </Card>

      <Can permission="subscription:modify">
        <div className="flex gap-3">
          {subscription.status === SubscriptionStatus.ACTIVE && (
            <>
              <Button variant="outline" onClick={() => setShowPauseDialog(true)}>
                <Pause className="mr-2 h-4 w-4" />Pause Subscription
              </Button>
              <Button variant="outline" onClick={() => setShowSkipDialog(true)}>
                <CalendarX className="mr-2 h-4 w-4" />Skip Dates
              </Button>
            </>
          )}
        </div>
      </Can>

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
