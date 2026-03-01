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
import { Plus, AlertCircle, Sparkles, LayoutGrid } from "lucide-react";

export default function SubscriptionPage() {
  const router = useRouter();

  // State for dialogs
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

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

  const handlePauseSubmit = (data: {
    start_date: string;
    end_date: string;
    reason?: string;
  }) => {
    if (selectedSubscription) {
      pauseMutation.mutate(
        { id: selectedSubscription._id, ...data },
        {
          onSuccess: (responseData) => {
            setPauseDialogOpen(false);
            setSelectedSubscription(null);
          },
        },
      );
    }
  };

  const handleCancelSubmit = (data: {
    cancellation_option: "CANCEL_ALL" | "CANCEL_RENEWAL";
    reason?: string;
  }) => {
    if (selectedSubscription) {
      cancelMutation.mutate(
        { id: selectedSubscription._id, ...data },
        {
          onSuccess: (responseData) => {
            setCancelDialogOpen(false);
            setSelectedSubscription(null);
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
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-sm" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Subscriptions</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          {error instanceof Error
            ? error.message
            : "Failed to load subscriptions. Please check your connection and try again."}
        </p>
        <Button size="lg" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-sm bg-primary/10 text-primary">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary/80">
              Manage
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3">
            Subscriptions
          </h1>
          <p className="text-lg text-muted-foreground ">
            Control your active meal plans, track deliveries, and manage
            renewals in one place.
          </p>
        </div>

        <Button
          onClick={() => router.push("/plans")}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          New Subscription
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent -z-10 h-64 pointer-events-none" />

        {/* Subscription List */}
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-gray-200 rounded-sm bg-gray-50/50">
            <div className="p-5 rounded-full bg-white shadow-sm mb-6 text-gray-400">
              <Sparkles className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Active Subscriptions</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-sm">
              Discover delicious, chef-curated meals delivered right to your
              doorstep. Start your journey today!
            </p>
            <Button
              onClick={() => router.push("/plans")}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              <Plus className="h-5 w-5" />
              Explore All Plans
            </Button>
          </div>
        ) : (
          <div className="pb-12">
            <SubscriptionList
              subscriptions={subscriptions}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onRenew={handleRenew}
              onToggleAutoRenew={handleToggleAutoRenew}
              onViewDetails={(id) => {
                // TODO: Implement subscription details page
                console.log("Subscription details coming soon for:", id);
              }}
            />
          </div>
        )}
      </div>

      {/* Dialogs remain the same in functionality but will pick up global styles */}
      <PauseSubscriptionDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        onSubmit={handlePauseSubmit}
        onCancel={() => {
          setPauseDialogOpen(false);
          setSelectedSubscription(null);
        }}
        minDate={new Date()}
        maxDate={
          selectedSubscription
            ? new Date(selectedSubscription.end_date)
            : undefined
        }
        warningMessage={
          selectedSubscription?.is_cancellable
            ? "Pausing your subscription will stop deliveries for the selected period."
            : "This subscription is past the cancellation window and cannot be paused."
        }
      />

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
