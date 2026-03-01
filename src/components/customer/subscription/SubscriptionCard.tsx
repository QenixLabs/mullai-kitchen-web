import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Subscription,
  SubscriptionStatus,
} from "@/api/types/subscription.types";
import {
  Calendar,
  MapPin,
  MoreVertical,
  RefreshCcw,
  Pause,
  Play,
  XCircle,
  CheckCircle2,
  Clock,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
          icon: <CheckCircle2 className="h-3 w-3" />,
        };
      case "PAUSED":
        return {
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
          icon: <Pause className="h-3 w-3" />,
        };
      case "EXPIRED":
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-200",
          icon: <Clock className="h-3 w-3" />,
        };
      case "CANCELLED":
        return {
          color: "bg-rose-500/10 text-rose-600 border-rose-200",
          icon: <XCircle className="h-3 w-3" />,
        };
      case "PENDING_RENEWAL":
        return {
          color: "bg-blue-500/10 text-blue-600 border-blue-200",
          icon: <RefreshCcw className="h-3 w-3" />,
        };
      default:
        return {
          color: "bg-gray-500/10 text-gray-600 border-gray-200",
          icon: <Clock className="h-3 w-3" />,
        };
    }
  };

  const progress =
    subscription.total_deliveries && subscription.total_deliveries > 0
      ? (subscription.completed_deliveries / subscription.total_deliveries) *
        100
      : 0;

  const statusConfig = getStatusConfig(subscription.status);

  // Fallback images based on meal types or plan name
  const getFallbackImage = () => {
    const name = subscription.plan_name.toLowerCase();
    if (name.includes("breakfast")) return "/images/plans/idli.jpg";
    if (name.includes("lunch")) return "/images/plans/office-lunch-monthly.jpg";
    if (name.includes("dinner") || name.includes("feast"))
      return "/images/plans/family-feast.jpg";
    return "/images/plans/why-choose.jpg";
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm bg-white transition-all duration-500 ease-out",
        "shadow-md hover:shadow-xl hover:shadow-primary/5",
        "border border-gray-100",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Image Section */}
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10" />
        <img
          src={getFallbackImage()}
          alt={subscription.plan_name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out",
            isHovered && "scale-105",
          )}
        />

        {/* Overlays */}
        {/* Overlays */}
        <div className="absolute top-3 left-3 z-30 flex gap-2">
          <Badge
            className={cn(
              "gap-1 px-2.5 py-1.5 border-0 shadow-lg backdrop-blur-md font-bold text-white",
              subscription.status === "ACTIVE"
                ? "bg-emerald-500"
                : subscription.status === "PAUSED"
                  ? "bg-amber-500"
                  : "bg-gray-600",
            )}
          >
            {statusConfig.icon}
            {subscription.status.replace(/_/g, " ")}
          </Badge>
          {subscription.auto_renew && (
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md gap-1 px-2.5 py-1.5 font-semibold">
              <RefreshCcw className="h-3 w-3" />
              Auto-renew
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3 z-40 text-white hover:bg-white/30 bg-black/40 backdrop-blur-sm rounded-full h-8 w-8 shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewDetails?.(subscription._id);
          }}
        >
          <MoreVertical className="h-5 w-5 drop-shadow-md" strokeWidth={3} />
        </Button>

        <div className="absolute bottom-3 left-3 z-20">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {subscription.plan_name}
          </h3>
          <p className="text-xs text-white/80 font-medium">
            {subscription.outlet_name || "Mullai Kitchen"}
          </p>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Info Rows */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-50 text-primary">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <span className="font-medium">
              {new Date(subscription.start_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
              -{" "}
              {new Date(subscription.end_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-50 text-primary">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span className="line-clamp-1 flex-1">
              {subscription.full_address}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-50 text-primary">
              <Utensils className="h-3.5 w-3.5" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {subscription.meals_included.map((meal) => (
                <span
                  key={meal}
                  className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 px-1.5 py-0.5 rounded-sm"
                >
                  {meal}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="pt-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Deliveries
            </span>
            <span className="text-sm font-bold text-gray-900">
              {subscription.completed_deliveries}{" "}
              <span className="text-gray-400 font-normal">
                / {subscription.total_deliveries ?? "-"}
              </span>
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,107,0,0.4)]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              Auto-renew
            </span>
            <button
              onClick={() => onToggleAutoRenew?.(subscription._id)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                subscription.auto_renew ? "bg-primary" : "bg-gray-200",
              )}
            >
              <span
                className={cn(
                  "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out",
                  subscription.auto_renew ? "translate-x-4.5" : "translate-x-1",
                )}
              />
            </button>
          </div>

          <div className="flex gap-2">
            {subscription.status === "ACTIVE" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold border-gray-200 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  onClick={() => onPause?.(subscription._id)}
                >
                  <Pause className="mr-1.5 h-3 w-3" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold border-gray-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  onClick={() => onCancel?.(subscription._id)}
                >
                  <XCircle className="mr-1.5 h-3 w-3" />
                  Cancel
                </Button>
              </>
            )}
            {subscription.status === "PAUSED" && (
              <Button
                size="sm"
                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onResume?.(subscription._id)}
              >
                <Play className="mr-1.5 h-3 w-3" />
                Resume
              </Button>
            )}
            {(subscription.status === "EXPIRED" ||
              subscription.status === "CANCELLED") && (
              <Button
                size="sm"
                className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                onClick={() => onRenew?.(subscription._id)}
              >
                <RefreshCcw className="mr-1.5 h-3 w-3" />
                Renew Plan
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Decorative Blur */}
      <div
        className={cn(
          "absolute -right-8 -bottom-8 h-16 w-16 rounded-full bg-primary/5 blur-xl transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0",
        )}
      />
    </article>
  );
}
