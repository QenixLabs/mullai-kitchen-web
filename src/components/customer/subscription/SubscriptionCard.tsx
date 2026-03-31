import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Subscription,
  SubscriptionStatus,
} from "@/api/types/subscription.types";
import {
  Utensils,
  CalendarDays,
  RotateCcw,
  Pause,
  Play,
  Info,
  PlusCircle,
} from "lucide-react";
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
  const getStatusConfig = (status: SubscriptionStatus) => {
    switch (status) {
      case STATUS.ACTIVE:
        return { bg: "bg-emerald-100 text-emerald-700", label: "Active" };
      case STATUS.PAUSED:
        return { bg: "bg-zinc-200 text-zinc-700", label: "Paused" };
      case STATUS.EXPIRED:
        return { bg: "bg-slate-200 text-slate-700", label: "Expired" };
      case STATUS.CANCELLED:
        return { bg: "bg-rose-100 text-rose-700", label: "Cancelled" };
      case STATUS.PENDING_RENEWAL:
        return { bg: "bg-blue-100 text-blue-700", label: "Pending Renewal" };
      default:
        return { bg: "bg-slate-200 text-slate-700", label: status };
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
  const progressPercentage = total > 0 ? Math.min((completed / total) * 100, 100) : 0;

  const mealsLabel = subscription.meals_included
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
    .join(" + ") || "Chef Curated Meals";

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateWithOrdinal = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const day = d.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";
    const month = d.toLocaleDateString("en-IN", { month: "long" });
    return `${day}${suffix} ${month}`;
  };

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[28px] border border-[#E9E5E7] shadow-none transition-colors",
        isPaused ? "bg-[#F5F1F3]" : "bg-[#FBFAFB]",
      )}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-[34%_66%]">
          <div className="relative min-h-56 sm:min-h-64 md:min-h-78 lg:min-h-86">
            <Image
              src="/images/subscriptions/Container.png"
              alt={subscription.plan_name}
              fill
              className={cn(
                "object-cover object-center",
                isPaused ? "opacity-60" : "opacity-100",
              )}
              sizes="(min-width: 768px) 34vw, 100vw"
              priority={false}
            />
            {isPaused && <div className="absolute inset-0 bg-white/25" />}
          </div>

          <div className="flex flex-col p-4 sm:p-5 md:p-6 lg:p-7">
            <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                    statusConfig.bg,
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusConfig.label}
                </span>
                <h3 className="mt-2 text-[30px] font-bold leading-tight text-[#231B21] sm:text-[34px] md:text-[40px] lg:text-[48px]">
                  {subscription.plan_name}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#5F5459] sm:text-base">
                  <Utensils className="h-3.5 w-3.5 shrink-0" />
                  <span>{mealsLabel}</span>
                </p>
              </div>

              <div className="w-full text-left sm:w-auto sm:text-right sm:shrink-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7B6E72]">
                  {isPaused ? "Resumes On" : "Next Delivery"}
                </p>
                <p className={cn(
                  "mt-1 text-[18px] font-bold sm:text-[22px]",
                  isPaused ? "text-[#5D5055]" : "text-[#5A1622]",
                )}>
                  {isPaused ? formatDateWithOrdinal(subscription.end_date) : formatDate(subscription.end_date)}
                </p>
              </div>
            </div>

            {total > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#4A3B40]">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Plan Progress
                  </span>
                  <span>
                    Day {completed} of {total}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#E4DEE1]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isPaused ? "bg-zinc-400" : "bg-linear-to-r from-[#5A0014] to-[#7A1023]",
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-1">
              {isActive && (
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-transparent bg-[#E8E4E6] px-5 text-sm font-semibold text-[#2E2326] hover:bg-[#DCD6D9]"
                  onClick={() => onPause?.(subscription._id)}
                >
                  <Pause className="mr-2 h-3.5 w-3.5" />
                  Pause
                </Button>
              )}

              {isPaused && (
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-transparent bg-[#5A1622] px-5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(90,22,34,0.25)] hover:bg-[#49121C]"
                  onClick={() => onResume?.(subscription._id)}
                >
                  <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                  Resume
                </Button>
              )}

              {isInactive && (
                <Button
                  className="h-10 rounded-full bg-[#5A1622] px-5 text-sm font-semibold text-white hover:bg-[#49121C]"
                  onClick={() => onRenew?.(subscription._id)}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Renew
                </Button>
              )}

              <Button
                variant="outline"
                className="h-10 rounded-full border-transparent bg-[#E8E4E6] px-5 text-sm font-semibold text-[#2E2326] hover:bg-[#DCD6D9]"
                onClick={() => onViewDetails?.(subscription._id)}
              >
                <Info className="mr-2 h-3.5 w-3.5" />
                View Details
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "h-10 rounded-full border-transparent px-5 text-sm font-semibold",
                  isPaused
                    ? "cursor-not-allowed bg-[#ECE7E9] text-[#9A8E92]"
                    : "bg-[#E8E4E6] text-[#2E2326] hover:bg-[#DCD6D9]",
                )}
                disabled={isPaused}
                onClick={() => !isPaused && onAddOn?.(subscription._id)}
              >
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Add-on
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
