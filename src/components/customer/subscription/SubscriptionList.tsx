import { SubscriptionCard } from "./SubscriptionCard";
import { Subscription } from "@/api/types/subscription.types";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRenew?: (id: string) => void;
  onToggleAutoRenew?: (id: string) => void;
  onOptOut?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function SubscriptionList({
  subscriptions,
  onPause,
  onResume,
  onCancel,
  onRenew,
  onToggleAutoRenew,
  onOptOut,
  onViewDetails,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          No subscriptions yet
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          You haven't subscribed to any meal plans yet. Browse our plans to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription._id}
          subscription={subscription}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
          onRenew={onRenew}
          onToggleAutoRenew={onToggleAutoRenew}
          onOptOut={onOptOut}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
