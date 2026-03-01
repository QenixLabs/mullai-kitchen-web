"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionList } from "@/components/customer/subscription/SubscriptionList";
import { PauseSubscriptionDialog } from "@/components/customer/subscription/PauseSubscriptionDialog";
import { CancelSubscriptionDialog } from "@/components/customer/subscription/CancelSubscriptionDialog";
import {
  useSubscriptions,
  usePauseSubscription,
  useResumeSubscription,
  useCancelSubscription,
  useRenewSubscription,
  useToggleAutoRenew,
} from "@/api/hooks/use-subscription";
import type { Subscription } from "@/api/types/subscription.types";
import { Plus, AlertCircle } from "lucide-react";

export default function SubscriptionPage() {
  const router = useRouter();

  // State for dialogs
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Query subscriptions
  const { data, isLoading, error } = useSubscriptions();

  // Mutations
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();
  const cancelMutation = useCancelSubscription();
  const renewMutation = useRenewSubscription();
  const toggleAutoRenewMutation = useToggleAutoRenew();

  const subscriptions = data?.subscriptions ?? [];

  // Handlers
  const handlePause = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      setSelectedSubscription(subscription);
      setPauseDialogOpen(true);
    }
  };

  const handleResume = (id: string) => {
    resumeMutation.mutate(
      { id, pause_period_id: "" },
      {
        onSuccess: (data) => {
          // TODO: Show success toast
        },
        onError: (error) => {
          // TODO: Show error toast
        },
      },
    );
  };

  const handleCancel = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      setSelectedSubscription(subscription);
      setCancelDialogOpen(true);
    }
  };

  const handleRenew = (id: string) => {
    renewMutation.mutate(
      { id, subscription_id: id, start_date: undefined },
      {
        onSuccess: (data) => {
          // TODO: Show success toast and maybe redirect to new subscription
        },
        onError: (error) => {
          // TODO: Show error toast
        },
      },
    );
  };

  const handleToggleAutoRenew = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      toggleAutoRenewMutation.mutate(
        { id, auto_renew: !subscription.auto_renew },
        {
          onSuccess: (data) => {
            // TODO: Show success toast
          },
          onError: (error) => {
            // TODO: Show error toast
          },
        },
      );
    }
  };

  const handlePauseSubmit = (data: { start_date: string; end_date: string; reason?: string }) => {
    if (selectedSubscription) {
      pauseMutation.mutate(
        { id: selectedSubscription._id, ...data },
        {
          onSuccess: (responseData) => {
            // TODO: Show success toast
            setPauseDialogOpen(false);
            setSelectedSubscription(null);
          },
          onError: (error) => {
            // TODO: Show error toast
          },
        },
      );
    }
  };

  const handleCancelSubmit = (data: { cancellation_option: "CANCEL_ALL" | "CANCEL_RENEWAL"; reason?: string }) => {
    if (selectedSubscription) {
      cancelMutation.mutate(
        { id: selectedSubscription._id, ...data },
        {
          onSuccess: (responseData) => {
            // TODO: Show success toast
            setCancelDialogOpen(false);
            setSelectedSubscription(null);
          },
          onError: (error) => {
            // TODO: Show error toast
          },
        },
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Error Loading Subscriptions</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load subscriptions. Please try again."}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your active meal subscriptions
        </p>
      </div>

      {/* New Subscription Button */}
      <div className="mb-6">
        <Button
          onClick={() => router.push("/plans")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Subscription
        </Button>
      </div>

      {/* Subscription List */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Subscriptions Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't subscribed to any meal plans yet. Browse our plans to get started!
          </p>
          <Button onClick={() => router.push("/plans")} className="gap-2">
            <Plus className="h-4 w-4" />
            Browse Plans
          </Button>
        </div>
      ) : (
        <SubscriptionList
          subscriptions={subscriptions}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
          onRenew={handleRenew}
          onToggleAutoRenew={handleToggleAutoRenew}
          onViewDetails={(id) => router.push(`/subscription/${id}`)}
        />
      )}

      {/* Pause Subscription Dialog */}
      <PauseSubscriptionDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        onSubmit={handlePauseSubmit}
        onCancel={() => {
          setPauseDialogOpen(false);
          setSelectedSubscription(null);
        }}
        minDate={new Date()}
        maxDate={selectedSubscription ? new Date(selectedSubscription.end_date) : undefined}
        warningMessage={selectedSubscription?.is_cancellable
          ? "Pausing your subscription will stop deliveries for the selected period."
          : "This subscription is past the cancellation window and cannot be paused."}
      />

      {/* Cancel Subscription Dialog */}
      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onSubmit={handleCancelSubmit}
        onCancel={() => {
          setCancelDialogOpen(false);
          setSelectedSubscription(null);
        }}
      />
    </div>
  );
}
