"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionList } from "@/components/customer/subscription/SubscriptionList";
import { PauseSubscriptionDialog } from "@/components/customer/subscription/PauseSubscriptionDialog";
import { CancelSubscriptionDialog } from "@/components/customer/subscription/CancelSubscriptionDialog";
import { OptOutSubscriptionDialog } from "@/components/customer/subscription/OptOutSubscriptionDialog";
import {
  useSubscriptions,
  usePauseSubscription,
  useCancelSubscription,
  useRenewSubscription,
  useToggleAutoRenew,
  useOptOutPeriods,
} from "@/api/hooks/use-subscription";
import type { Subscription } from "@/api/types/subscription.types";
import { FaPlus, FaExclamationCircle, FaStar } from "react-icons/fa";

export default function SubscriptionPage() {
  const router = useRouter();

  // State for dialogs
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [optOutDialogOpen, setOptOutDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  // Query subscriptions
  const { data, isLoading, error } = useSubscriptions();

  // Mutations
  const pauseMutation = usePauseSubscription();
  const cancelMutation = useCancelSubscription();
  const renewMutation = useRenewSubscription();
  const toggleAutoRenewMutation = useToggleAutoRenew();

  // Query opt-out periods for selected subscription
  const { data: optOutData } = useOptOutPeriods(selectedSubscription?._id || "");

  const subscriptions = data?.subscriptions ?? [];

  // Handlers
  const handlePause = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      setSelectedSubscription(subscription);
      setPauseDialogOpen(true);
    }
  };

  const handleCancel = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      setSelectedSubscription(subscription);
      setCancelDialogOpen(true);
    }
  };

  const handleOptOut = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      setSelectedSubscription(subscription);
      setOptOutDialogOpen(true);
    }
  };

  const handleRenew = (id: string) => {
    renewMutation.mutate(
      { id, subscription_id: id, start_date: undefined },
    );
  };

  const handleAddOn = (_id: string) => {
    router.push("/add-ons");
  };

  const handleToggleAutoRenew = (id: string) => {
    const subscription = subscriptions.find((s) => s._id === id);
    if (subscription) {
      toggleAutoRenewMutation.mutate(
        { id, auto_renew: !subscription.auto_renew },
      );
    }
  };

  const handlePauseSubmit = (data: {
    paused_dates: string[];
    reason?: string;
  }) => {
    if (selectedSubscription) {
      pauseMutation.mutate(
        { id: selectedSubscription._id, ...data },
        {
          onSuccess: (responseData) => {
            toast.success("Subscription paused successfully", {
              description: `₹${responseData.total_credit} credited to your wallet. This action is permanent and cannot be undone.`,
            });
            setPauseDialogOpen(false);
            setSelectedSubscription(null);
          },
          onError: (error: Error) => {
            toast.error("Failed to pause subscription", {
              description: error.message || "Please try again later.",
            });
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
          onSuccess: () => {
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
      <div className="container mx-auto max-w-350 p-4 sm:p-6 md:p-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-4" />
          <Skeleton className="h-4 w-64 sm:w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-40 sm:h-48 w-full rounded-sm" />
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
      <div className="container mx-auto flex min-h-75 max-w-7xl flex-col items-center justify-center p-4 sm:min-h-100 sm:p-6">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <FaExclamationCircle className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">Error Loading Subscriptions</h2>
        <p className="text-muted-foreground mb-8 text-center text-sm sm:text-base px-4">
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
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mb-1 text-[28px] font-black uppercase leading-none tracking-tight text-[#3A1018] sm:text-[32px] lg:text-[34px]">
            SUBSCRIPTIONS
          </h1>
          <p className="text-sm text-[#3B3336] sm:text-base md:text-lg">
            Control your active meal plans, track deliveries, and manage renewals in one place.
          </p>
          {/* Status count badges */}
          {subscriptions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {subscriptions.filter(s => s.status === 'active').length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
                  {subscriptions.filter(s => s.status === 'active').length} Active
                </span>
              )}
              {subscriptions.filter(s => s.status === 'paused').length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200 px-3 py-1 text-sm font-semibold text-zinc-700">
                  {subscriptions.filter(s => s.status === 'paused').length} Paused
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={() => router.push("/plans")}
          size="lg"
          className="h-12 w-full shrink-0 gap-2 rounded-full bg-[#5A0F1F] px-8 text-white shadow-sm hover:bg-[#4A0C19] md:w-auto"
        >
          <FaPlus className="h-4 w-4" />
          New Subscription
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 -z-10 h-48 bg-linear-to-b from-[#F8F4F6] to-transparent pointer-events-none sm:h-64" />

        {/* Subscription List */}
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 border-2 border-dashed border-gray-200 rounded-sm bg-gray-50/50">
            <div className="p-4 sm:p-5 rounded-full bg-white shadow-sm mb-6 text-gray-400">
              <FaStar className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center text-primary">No Active Subscriptions</h3>
            <p className="text-muted-foreground mb-8 text-center text-sm sm:text-base max-w-md px-4">
              Discover delicious, chef-curated meals delivered right to your
              doorstep. Start your journey today!
            </p>
            <Button
              onClick={() => router.push("/plans")}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
          <FaPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              Explore All Plans
            </Button>
          </div>
        ) : (
          <div className="pb-8 sm:pb-10 lg:pb-12">
            <h2 className="mb-4 text-2xl font-bold leading-none text-[#3A1018] sm:text-[30px] lg:text-[38px]">Active Subscriptions</h2>
            <SubscriptionList
              subscriptions={subscriptions}
              onPause={handlePause}
              onCancel={handleCancel}
              onRenew={handleRenew}
              onToggleAutoRenew={handleToggleAutoRenew}
              onOptOut={handleOptOut}
              onViewDetails={(id) => {
                // TODO: Implement subscription details page
                console.log("Subscription details coming soon for:", id);
              }}
              onAddOn={handleAddOn}
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
        subscriptionStartDate={
          selectedSubscription
            ? new Date(selectedSubscription.start_date)
            : new Date()
        }
        subscriptionEndDate={
          selectedSubscription
            ? new Date(selectedSubscription.end_date)
            : new Date()
        }
        perDayPrice={
          selectedSubscription?.total_amount && selectedSubscription?.total_deliveries
            ? selectedSubscription.total_amount / selectedSubscription.total_deliveries
            : 0
        }
        existingPausedDates={selectedSubscription?.paused_dates || []}
        warningMessage="IMPORTANT: Pause is permanent and cannot be undone. Once you pause dates, you cannot resume deliveries for those dates."
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

      <OptOutSubscriptionDialog
        open={optOutDialogOpen}
        onOpenChange={setOptOutDialogOpen}
        subscriptionId={selectedSubscription?._id || ""}
        subscriptionStartDate={selectedSubscription ? new Date(selectedSubscription.start_date) : new Date()}
        subscriptionEndDate={selectedSubscription ? new Date(selectedSubscription.end_date) : new Date()}
        totalDeliveries={selectedSubscription?.total_deliveries || 0}
        maxOptOutDays={selectedSubscription ? Math.floor((selectedSubscription.total_deliveries || 0) * 0.5) : 0}
        daysAlreadyOptedOut={optOutData?.opt_out_periods?.reduce((acc, period) => acc + (period.days_opted_out || 0), 0) || 0}
        perDayPrice={selectedSubscription?.total_amount && selectedSubscription?.total_deliveries
          ? selectedSubscription.total_amount / selectedSubscription.total_deliveries
          : 0}
        onSuccess={() => {
          setSelectedSubscription(null);
        }}
      />
    </div>
  );
}
