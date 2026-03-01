import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription, SubscriptionStatus } from "@/api/types/subscription.types";
import { Calendar, MapPin, MoreVertical } from "lucide-react";

interface SubscriptionCardProps {
  subscription: Subscription;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRenew?: (id: string) => void;
  onToggleAutoRenew?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onPause,
  onResume,
  onCancel,
  onRenew,
  onToggleAutoRenew,
  onViewDetails,
}: SubscriptionCardProps) {
  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING_RENEWAL":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const progress =
    subscription.total_deliveries && subscription.total_deliveries > 0
      ? (subscription.completed_deliveries / subscription.total_deliveries) * 100
      : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold">
            {subscription.plan_name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(subscription.status)}>
              {subscription.status.replace(/_/g, " ")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {subscription.outlet_name}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails?.(subscription._id)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(subscription.start_date).toLocaleDateString()} -{" "}
            {new Date(subscription.end_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{subscription.full_address}</span>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Deliveries</span>
            <span className="font-medium">
              {subscription.completed_deliveries} /{" "}
              {subscription.total_deliveries ?? "-"}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-renew</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleAutoRenew?.(subscription._id)}
            >
              {subscription.auto_renew ? "On" : "Off"}
            </Button>
          </div>
          <div className="flex gap-2">
            {subscription.status === "ACTIVE" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPause?.(subscription._id)}
                >
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel?.(subscription._id)}
                >
                  Cancel
                </Button>
              </>
            )}
            {subscription.status === "PAUSED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResume?.(subscription._id)}
              >
                Resume
              </Button>
            )}
            {(subscription.status === "EXPIRED" ||
              subscription.status === "CANCELLED") && (
              <Button size="sm" onClick={() => onRenew?.(subscription._id)}>
                Renew
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
