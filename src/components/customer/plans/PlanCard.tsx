"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Calendar, UtensilsCrossed } from "lucide-react";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanBrowseItem;
  onViewMenu: (plan: PlanBrowseItem) => void;
  onSelectPlan: (plan: PlanBrowseItem) => void;
  isSelected?: boolean;
  className?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function PlanCard({
  plan,
  onViewMenu,
  onSelectPlan,
  isSelected = false,
  className,
}: PlanCardProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [plan.image_url]);

  const fallbackImage = "/images/plans/why-choose.jpg";
  const imageSrc = !plan.image_url || imageLoadFailed ? fallbackImage : plan.image_url;
  const isFallback = !plan.image_url || imageLoadFailed;
  const isWeekly = plan.duration.toLowerCase().includes("week");
  const periodLabel = isWeekly ? "week" : "month";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500 ease-out",
        "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_4px_20px_rgba(255,107,53,0.15),0_8px_40px_rgba(0,0,0,0.1)]",
        isSelected && [
          "ring-2 ring-[#FF6B35] ring-offset-2 ring-offset-white",
          "shadow-[0_4px_20px_rgba(255,107,53,0.2),0_8px_40px_rgba(0,0,0,0.1)]",
        ],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B35] shadow-lg">
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Image section with gradient overlay */}
      <div className="relative h-48 overflow-hidden sm:h-56">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <img
          src={imageSrc}
          alt={plan.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out",
            isHovered && "scale-110",
            isFallback && "object-contain p-6"
          )}
          loading="lazy"
          onError={() => setImageLoadFailed(true)}
        />

        {/* Badge positioned on image */}
        {plan.badge && (
          <Badge
            className="absolute left-4 top-4 z-10 gap-1.5 border-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8F65] px-3 py-1.5 text-white shadow-md"
          >
            <Sparkles className="h-3 w-3" />
            {plan.badge}
          </Badge>
        )}

        {/* Plan type indicator */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md",
            isWeekly
              ? "bg-emerald-500/20 text-emerald-100"
              : "bg-amber-500/20 text-amber-100"
          )}>
            <Calendar className="h-3 w-3" />
            {isWeekly ? "Weekly Plan" : "Monthly Plan"}
          </div>
        </div>

        {/* Price tag on image */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-white/80">Starting from</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-bold text-white">
                {currencyFormatter.format(plan.price)}
              </span>
              <span className="text-sm font-medium text-white/80">/{periodLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title and description */}
        <div className="mb-4">
          <h3 className="mb-1.5 text-xl font-bold tracking-tight text-gray-900">
            {plan.name}
          </h3>
          {plan.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
              {plan.description}
            </p>
          )}
        </div>

        {/* Meals included */}
        <div className="mb-5 flex-1">
          <div className="mb-2.5 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-[#FF6B35]" />
            <span className="text-sm font-semibold text-gray-700">Meals Included</span>
          </div>
          {plan.meals_included.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2" aria-label={`Meals in ${plan.name}`}>
              {plan.meals_included.map((meal) => (
                <li
                  key={`${plan._id}-${meal}`}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors group-hover:bg-orange-50"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35]/10">
                    <Check className="h-3 w-3 text-[#FF6B35]" strokeWidth={3} />
                  </span>
                  <span className="font-medium">{meal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">Meal details coming soon</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            className={cn(
              "relative h-11 overflow-hidden rounded-xl font-semibold text-white shadow-md transition-all duration-300",
              "bg-gradient-to-r from-[#FF6B35] to-[#FF8555]",
              "hover:from-[#E85A25] hover:to-[#FF7545] hover:shadow-lg hover:shadow-orange-200/50",
              "active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
            )}
            onClick={() => onSelectPlan(plan)}
            aria-label={`Get started with ${plan.name} plan`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started Now
              <svg
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isHovered && "translate-x-1"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 rounded-xl font-medium transition-all duration-300",
              "border-2 border-gray-200 bg-white text-gray-600",
              "hover:border-[#FF6B35]/30 hover:bg-orange-50 hover:text-[#FF6B35]",
              "active:scale-[0.98]"
            )}
            onClick={() => onViewMenu(plan)}
            aria-label={`View menu for ${plan.name}`}
          >
            View Menu
          </Button>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div
        className={cn(
          "absolute -right-12 -top-12 h-24 w-24 rounded-full bg-gradient-to-br from-[#FF6B35]/10 to-transparent blur-2xl transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
    </article>
  );
}
