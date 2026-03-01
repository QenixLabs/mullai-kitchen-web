import { SubscriptionCard } from "./SubscriptionCard";
import { Subscription } from "@/api/types/subscription.types";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRenew?: (id: string) => void;
  onToggleAutoRenew?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function SubscriptionList({
  subscriptions,
  onPause,
  onResume,
  onCancel,
  onRenew,
  onToggleAutoRenew,
  onViewDetails,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No subscriptions found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription._id}
          subscription={subscription}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
          onRenew={onRenew}
          onToggleAutoRenew={onToggleAutoRenew}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
