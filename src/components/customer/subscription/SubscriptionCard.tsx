import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Subscription,
  SubscriptionStatus,
} from "@/api/types/subscription.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const STATUS = {
  ACTIVE: 'active' as SubscriptionStatus,
  PAUSED: 'paused' as SubscriptionStatus,
  EXPIRED: 'expired' as SubscriptionStatus,
  CANCELLED: 'cancelled' as SubscriptionStatus,
  PENDING_RENEWAL: 'pending_renewal' as SubscriptionStatus,
} as const;

import {
  CalendarDays,
  MapPin,
  MoreVertical,
  RotateCcw,
  Pause,
  XCircle,
  CheckCircle2,
  Clock,
  Utensils,
  CalendarX2,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  subscription: Subscription;
  pausedDates?: Date[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRenew?: (id: string) => void;
  onToggleAutoRenew?: (id: string) => void;
  onOptOut?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function SubscriptionCard({
  subscription,
  pausedDates = [],
  onPause,
  onResume,
  onCancel,
  onRenew,
  onToggleAutoRenew,
  onOptOut,
  onViewDetails,
}: SubscriptionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case STATUS.ACTIVE:
        return {
          bg: "bg-emerald-500",
          light: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case STATUS.PAUSED:
        return {
          bg: "bg-amber-500",
          light: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Pause,
        };
      case STATUS.EXPIRED:
        return {
          bg: "bg-slate-500",
          light: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Clock,
        };
      case STATUS.CANCELLED:
        return {
          bg: "bg-rose-500",
          light: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
        };
      case STATUS.PENDING_RENEWAL:
        return {
          bg: "bg-blue-500",
          light: "bg-blue-50 text-blue-700 border-blue-200",
          icon: RotateCcw,
        };
      default:
        return {
          bg: "bg-slate-500",
          light: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Clock,
        };
    }
  };

  const progress =
    subscription.total_deliveries && subscription.total_deliveries > 0
      ? Math.round((subscription.completed_deliveries / subscription.total_deliveries) * 100)
      : 0;

  const statusConfig = getStatusConfig(subscription.status);
  const StatusIcon = statusConfig.icon;

  // Fallback images based on meal types or plan name
  const getFallbackImage = () => {
    const name = subscription.plan_name.toLowerCase();
    if (name.includes("breakfast")) return "/images/plans/idli.jpg";
    if (name.includes("lunch")) return "/images/plans/office-lunch-monthly.jpg";
    if (name.includes("dinner") || name.includes("feast"))
      return "/images/plans/family-feast.jpg";
    return "/images/plans/why-choose.jpg";
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateWithYear = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isActive = subscription.status === STATUS.ACTIVE;
  const isInactive = subscription.status === STATUS.EXPIRED || subscription.status === STATUS.CANCELLED;

  return (
    <Card className="group overflow-hidden border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
      {/* Image Header */}
      <div className="relative h-36 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

        {/* Image */}
        <img
          src={getFallbackImage()}
          alt={subscription.plan_name}
          className={cn(
            "h-full w-full object-cover transition-all duration-700",
            "group-hover:scale-105",
            !imageLoaded && "blur-sm"
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-20">
          <Badge
            className={cn(
              "gap-1.5 px-2.5 py-1 text-xs font-semibold border-0 shadow-lg",
              statusConfig.bg,
              "text-white"
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            <span className="capitalize">{subscription.status.replace(/_/g, " ")}</span>
          </Badge>
        </div>

        {/* Auto-renew Badge */}
        {subscription.auto_renew && (
          <div className="absolute top-3 right-3 z-20">
            <Badge
              variant="secondary"
              className="gap-1.5 px-2 py-1 text-[10px] font-medium bg-white/90 text-slate-700 backdrop-blur-sm border-0 shadow-md"
            >
              <RotateCcw className="h-3 w-3" />
              Auto
            </Badge>
          </div>
        )}

        {/* Plan Info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">
            {subscription.plan_name}
          </h3>
          <p className="text-sm text-white/80 font-medium">
            {subscription.outlet_name || "Mullai Kitchen"}
          </p>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Info Grid */}
        <div className="space-y-2.5">
          {/* Date Range */}
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <CalendarDays className="h-3.5 w-3.5" />
            </div>
            <span className="text-slate-700 font-medium">
              {formatDate(subscription.start_date)}
              <span className="text-slate-400 mx-1.5">→</span>
              {formatDateWithYear(subscription.end_date)}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2.5 text-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 mt-0.5">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span className="text-slate-600 line-clamp-2 leading-relaxed">
              {subscription.full_address}
            </span>
          </div>

          {/* Meals */}
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Utensils className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-wrap gap-1">
              {subscription.meals_included.map((meal) => (
                <Badge
                  key={meal}
                  variant="secondary"
                  className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-700 hover:bg-slate-100 px-1.5 py-0.5"
                >
                  {meal}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="text-slate-900 font-semibold">
              {subscription.completed_deliveries}{" "}
              <span className="text-slate-400 font-normal">
                / {subscription.total_deliveries ?? "-"}
              </span>
              <span className="ml-1 text-slate-500">({progress}%)</span>
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                progress >= 100 ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* Paused Dates Display */}
        {pausedDates.length > 0 && (
          <div className="pt-2 pb-1">
            <div className="flex items-start gap-2.5 text-sm">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                <Pause className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <span className="text-amber-700 font-medium">
                  {pausedDates.length} date{pausedDates.length !== 1 ? "s" : ""} paused
                </span>
                <p className="text-amber-600/80 text-xs mt-0.5">
                  {pausedDates.slice(0, 3).map(d => format(new Date(d), "MMM d")).join(", ")}
                  {pausedDates.length > 3 && ` +${pausedDates.length - 3} more`}
                </p>
                <p className="text-amber-600/60 text-xs mt-1 italic">
                  Pause is permanent
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          {/* Auto-renew Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id={`auto-renew-${subscription._id}`}
              checked={subscription.auto_renew}
              onCheckedChange={() => onToggleAutoRenew?.(subscription._id)}
              className="data-[state=checked]:bg-primary"
            />
            <label
              htmlFor={`auto-renew-${subscription._id}`}
              className="text-xs font-medium text-slate-600 cursor-pointer"
            >
              Auto-renew
            </label>
          </div>

          <div className="flex-1" />

          {/* Primary Action */}
          {isActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              onClick={() => onPause?.(subscription._id)}
            >
              <Pause className="mr-1.5 h-3.5 w-3.5" />
              Pause
            </Button>
          )}

          {isInactive && (
            <Button
              size="sm"
              className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
              onClick={() => onRenew?.(subscription._id)}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Renew
            </Button>
          )}

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails?.(subscription._id)}>
                <ChevronRight className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {isActive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onOptOut?.(subscription._id)}>
                    <CalendarX2 className="mr-2 h-4 w-4" />
                    Opt Out Dates
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCancel?.(subscription._id)}
                    className="text-rose-600 focus:text-rose-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Plan
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
