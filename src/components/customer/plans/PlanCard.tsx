"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, Calendar, UtensilsCrossed, ArrowRight, Clock, Flame } from "lucide-react";

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
  variant?: "default" | "compact";
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
  variant = "default",
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
  const mealsPerDay = plan.meals_included.length;

  // Compact variant for mobile horizontal scroll
  if (variant === "compact") {
    return (
      <article
        className={cn(
          "group relative flex w-72 flex-col overflow-hidden rounded-xl bg-white shrink-0",
          "shadow-md",
          "transition-all duration-300",
          isSelected && "ring-2 ring-primary ring-offset-2",
          className
        )}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
          </div>
        )}

        {/* Image */}
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <img
            src={imageSrc}
            alt={plan.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-500",
              isFallback && "object-contain p-4"
            )}
            loading="lazy"
            onError={() => setImageLoadFailed(true)}
          />

          {/* Badge */}
          {plan.badge && (
            <Badge className="absolute left-3 top-3 z-10 gap-1 border-0 bg-primary px-2 py-1 text-[10px] text-primary-foreground">
              <Sparkles className="h-2.5 w-2.5" />
              {plan.badge}
            </Badge>
          )}

          {/* Price on image */}
          <div className="absolute bottom-2 right-2 z-10 text-right">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-white">
                {currencyFormatter.format(plan.price)}
              </span>
              <span className="text-xs text-white/80">/{periodLabel}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-[10px] font-medium",
                isWeekly ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                <Calendar className="h-2.5 w-2.5" />
                {isWeekly ? "Weekly" : "Monthly"}
              </span>
              <span className="text-[10px] text-gray-400">{mealsPerDay} meals/day</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
          </div>

          {/* Meals - horizontal scroll */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {plan.meals_included.map((meal) => (
              <span
                key={`${plan._id}-${meal}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
              >
                <Check className="h-2.5 w-2.5 text-primary" />
                {meal}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Button
            type="button"
            className={cn(
              "mt-auto h-10 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md transition-all duration-300",
              "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
              "active:scale-[0.98]"
            )}
            onClick={() => onSelectPlan(plan)}
          >
            Get Started
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </article>
    );
  }

  // Default variant - sophisticated card design
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-500 ease-out",
        "shadow-md",
        "hover:shadow-primary",
        isSelected && [
          "ring-2 ring-primary ring-offset-2 ring-offset-white",
          "shadow-primary",
        ],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg">
          <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
        </div>
      )}

      {/* Image section with gradient overlay */}
      <div className="relative h-44 overflow-hidden sm:h-52 lg:h-48">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <img
          src={imageSrc}
          alt={plan.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out",
            isHovered && "scale-105",
            isFallback && "object-contain p-6"
          )}
          loading="lazy"
          onError={() => setImageLoadFailed(true)}
        />

        {/* Badge positioned on image */}
        {plan.badge && (
          <Badge
            className="absolute left-4 top-4 z-10 gap-1.5 border-0 bg-primary px-3 py-1.5 text-primary-foreground shadow-md"
          >
            <Sparkles className="h-3 w-3" />
            {plan.badge}
          </Badge>
        )}

        {/* Plan type indicator */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium backdrop-blur-md",
            isWeekly
              ? "bg-emerald-500/20 text-emerald-100"
              : "bg-amber-500/20 text-amber-100"
          )}>
            <Calendar className="h-3 w-3" />
            {isWeekly ? "Weekly Plan" : "Monthly Plan"}
          </div>
        </div>

        {/* Price tag on image */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="flex flex-col items-end rounded-xl bg-black/30 px-3 py-2 backdrop-blur-sm">
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/70">From</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-white sm:text-3xl">
                {currencyFormatter.format(plan.price)}
              </span>
              <span className="text-sm font-medium text-white/80">/{periodLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title and description */}
        <div className="mb-3 sm:mb-4">
          <h3 className="mb-1 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            {plan.name}
          </h3>
          {plan.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
              {plan.description}
            </p>
          )}
        </div>

        {/* Quick stats */}
        <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{isWeekly ? "7 days" : "30 days"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span>{mealsPerDay} meals/day</span>
          </div>
        </div>

        {/* Meals included */}
        <div className="mb-4 flex-1 sm:mb-5">
          <div className="mb-2 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 sm:text-sm">Meals Included</span>
          </div>
          {plan.meals_included.length > 0 ? (
            <ul className="grid grid-cols-2 gap-1.5 sm:gap-2" aria-label={`Meals in ${plan.name}`}>
              {plan.meals_included.map((meal) => (
                <li
                  key={`${plan._id}-${meal}`}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 transition-colors group-hover:bg-accent sm:px-3 sm:py-2 sm:text-sm"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-xl bg-primary/10 sm:h-5 sm:w-5">
                    <Check className="h-2.5 w-2.5 text-primary sm:h-3 sm:w-3" strokeWidth={3} />
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
        <div className="flex flex-col gap-2 sm:gap-2.5">
          <Button
            type="button"
            className={cn(
              "relative h-10 overflow-hidden rounded-xl bg-primary font-semibold text-primary-foreground shadow-md transition-all duration-300 sm:h-11",
              "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
              "active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            )}
            onClick={() => onSelectPlan(plan)}
            aria-label={`Get started with ${plan.name} plan`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started Now
              <ArrowRight
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isHovered && "translate-x-1"
                )}
              />
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 rounded-xl font-medium transition-all duration-300 sm:h-10",
              "border-2 border-gray-200 bg-white text-gray-600",
              "hover:border-primary/30 hover:bg-accent hover:text-primary",
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
          "absolute -right-12 -top-12 h-24 w-24 rounded-xl bg-primary/10 blur-2xl transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />
    </article>
  );
}
