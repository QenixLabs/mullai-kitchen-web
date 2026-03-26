import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Subscription,
  SubscriptionStatus,
  MealType,
} from "@/api/types/subscription.types";
import { Utensils, CalendarDays, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS = {
  ACTIVE: "active" as SubscriptionStatus,
  PAUSED: "paused" as SubscriptionStatus,
  EXPIRED: "expired" as SubscriptionStatus,
  CANCELLED: "cancelled" as SubscriptionStatus,
  PENDING_RENEWAL: "pending_renewal" as SubscriptionStatus,
} as const;

interface SubscriptionCardProps {
  subscription: Subscription;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRenew?: (id: string) => void;
  onToggleAutoRenew?: (id: string) => void;
  onOptOut?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onAddOn?: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  onPause,
  onResume,
  onCancel: _onCancel,
  onRenew,
  onToggleAutoRenew: _onToggleAutoRenew,
  onOptOut: _onOptOut,
  onViewDetails,
  onAddOn,
}: SubscriptionCardProps) {
  const getFallbackImage = () => {
    const meals = subscription.meals_included ?? [];
    if (meals.length >= 3) return "/images/plans/thali.png";
    if (
      meals.includes("dinner" as MealType) ||
      meals.includes("DINNER" as MealType)
    )
      return "/images/plans/thali.png";
    if (
      meals.includes("lunch" as MealType) ||
      meals.includes("LUNCH" as MealType)
    )
      return "/images/plans/office-lunch-monthly.jpg";
    if (
      meals.includes("breakfast" as MealType) ||
      meals.includes("BREAKFAST" as MealType)
    )
      return "/images/plans/idli.jpg";
    return "/images/plans/thali.png";
  };

  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case STATUS.ACTIVE:
        return { bg: "bg-emerald-500", label: "Active" };
      case STATUS.PAUSED:
        return { bg: "bg-amber-400", label: "Paused" };
      case STATUS.EXPIRED:
        return { bg: "bg-slate-400", label: "Expired" };
      case STATUS.CANCELLED:
        return { bg: "bg-rose-500", label: "Cancelled" };
      case STATUS.PENDING_RENEWAL:
        return { bg: "bg-blue-500", label: "Pending Renewal" };
      default:
        return { bg: "bg-slate-400", label: status };
    }
  };

  const statusConfig = getStatusConfig(subscription.status);
  const isActive = subscription.status === STATUS.ACTIVE;
  const isPaused = subscription.status === STATUS.PAUSED;
  const isInactive =
    subscription.status === STATUS.EXPIRED ||
    subscription.status === STATUS.CANCELLED;

  const total = subscription.total_deliveries ?? 0;
  const completed = subscription.completed_deliveries ?? 0;

  // Progress dots — max 30 dots, scale completed proportionally
  const DOT_COUNT = Math.min(total, 30);
  const filledDots =
    total > 0 ? Math.round((completed / total) * DOT_COUNT) : 0;
  const dotColor = isPaused ? "bg-amber-400" : "bg-primary";

  const mealsLabel = subscription.meals_included
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
    .join(" + ");

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative">
      {/* Thali image — floats outside the card, overflows top and bottom - hidden on mobile */}
      <div className="hidden md:block absolute right-0 -top-6 -bottom-6 w-48 lg:w-64 pointer-events-none select-none z-10">
        <Image
          src={getFallbackImage()}
          alt={subscription.plan_name}
          fill
          className="object-contain object-center"
        />
      </div>

      <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 sm:p-6 pb-4 sm:pb-5 space-y-3 pr-0 md:pr-48 lg:pr-60">
          {/* Status badge */}
          <div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 sm:px-3 py-1 text-white text-xs sm:text-sm font-semibold",
                statusConfig.bg,
              )}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Plan name — Inter Bold 32 */}
          <h3 className="text-xl sm:text-[32px] font-bold text-primary leading-tight">
            {subscription.plan_name}
          </h3>

          {/* Info row: Meals + Date */}
          <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 shrink-0" />
              <span>
                Meals :{" "}
                <span className="font-semibold text-foreground">
                  {mealsLabel}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>
                Ends :{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(subscription.end_date)}
                </span>
              </span>
            </span>
          </div>

          {/* Progress dots — inline with Day label */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-semibold text-foreground shrink-0">
                Day {completed}/{total}
              </span>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: DOT_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 w-4 sm:h-2.5 sm:w-6 rounded-full",
                      i < filledDots ? dotColor : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2">
            {isActive && (
              <Button
                variant="outline"
                className="gap-2 font-semibold text-primary bg-secondary/20 border-secondary/40 hover:bg-secondary/40"
                onClick={() => onPause?.(subscription._id)}
              >
                <Image
                  src="/images/subscriptions/pause.png"
                  width={16}
                  height={16}
                  alt="pause"
                  className="shrink-0"
                />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button
                variant="outline"
                className="gap-2 font-semibold text-primary bg-secondary/20 border-secondary/40 hover:bg-secondary/40"
                onClick={() => onResume?.(subscription._id)}
              >
                <Image
                  src="/images/subscriptions/play.png"
                  width={16}
                  height={16}
                  alt="play"
                  className="shrink-0"
                />
                Paused
              </Button>
            )}
            {isInactive && (
              <Button
                className="gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => onRenew?.(subscription._id)}
              >
                <RotateCcw className="h-4 w-4" />
                Renew
              </Button>
            )}

            {/* View Details */}
            <Button
              variant="outline"
              className="bg-secondary/20 text-primary border-secondary/40 hover:bg-secondary/40"
              onClick={() => onViewDetails?.(subscription._id)}
            >
              View Details
            </Button>

            <Button
              className={cn(
                "gap-2 font-semibold text-[#FBFBFB]",
                isPaused
                  ? "bg-primary/50 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90",
              )}
              disabled={isPaused}
              onClick={() => !isPaused && onAddOn?.(subscription._id)}
            >
              <Image
                src="/images/plans/white-bell.png"
                width={16}
                height={16}
                alt=""
                className="shrink-0"
                style={{ filter: "brightness(0) invert(1) opacity(0.98)" }}
              />
              Add on
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
