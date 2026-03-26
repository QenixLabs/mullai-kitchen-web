"use client";

import { useState } from "react";
import Image from "next/image";
import { FaCheck, FaStar, FaCalendarAlt, FaArrowRight, FaClock, FaFire } from "react-icons/fa";

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

  const fallbackImage = "/images/plans/thali.png";
  const imageSrc = !plan.image_url || imageLoadFailed ? fallbackImage : plan.image_url;
  const isFallback = !plan.image_url || imageLoadFailed;
  const isWeekly = plan.duration.toLowerCase().includes("week");
  const periodLabel = isWeekly ? "week" : "month";
  const mealsPerDay = plan.meals_included.length;

  const handleSelectPlan = () => {
    onSelectPlan(plan);
  };

  const handleViewMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewMenu(plan);
  };

  const badgeColorClass = plan.badge
    ? /popular/i.test(plan.badge)
      ? 'bg-warning text-foreground'
      : /recommend/i.test(plan.badge)
      ? 'bg-primary/10 text-primary border border-primary/20'
      : /value|best/i.test(plan.badge)
      ? 'bg-success text-success-foreground'
      : 'bg-primary text-primary-foreground'
    : '';

  // Compact variant for mobile horizontal scroll
  if (variant === "compact") {
    return (
      <article
        className={cn(
          "group relative flex w-72 flex-col overflow-hidden rounded-sm bg-card shrink-0",
          "shadow-md",
          "transition-all duration-300",
          isSelected && "ring-2 ring-primary ring-offset-2",
          className
        )}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-sm bg-primary shadow-lg">
            <FaCheck className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}

        {/* Image */}
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          <Image
            src={imageSrc}
            alt={plan.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              isFallback && "object-contain p-4"
            )}
            sizes="(max-width: 768px) 288px, 288px"
            onError={() => setImageLoadFailed(true)}
          />

          {/* Badge */}
          {plan.badge && (
            <Badge className={cn("absolute left-3 top-3 z-10 gap-1 border-0 px-2 py-1 text-[10px]", badgeColorClass)}>
              <FaStar className="h-2.5 w-2.5" />
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
                "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-medium",
                isWeekly ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}>
                <FaCalendarAlt className="h-2.5 w-2.5" />
                {isWeekly ? "Weekly" : "Monthly"}
              </span>
              <span className="text-[10px] text-muted-foreground">{mealsPerDay} meals/day</span>
            </div>
            <h3 className="text-base font-bold text-primary">{plan.name}</h3>
          </div>

          {/* Meals - horizontal scroll */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {plan.meals_included.map((meal) => (
              <span
                key={`${plan._id}-${meal}`}
                className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                <FaCheck className="h-2.5 w-2.5 text-primary" />
                {meal}
              </span>
            ))}
          </div>

          {/* CTA - Simple Get Started */}
          <Button
            type="button"
            className={cn(
              "mt-auto h-10 rounded-sm bg-primary font-semibold text-primary-foreground shadow-md transition-all duration-300",
              "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/10",
              "active:scale-[0.98]"
            )}
            onClick={handleSelectPlan}
          >
            Get Started
            <FaArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-visible rounded-2xl bg-card border border-border shadow-sm transition-all duration-200",
        "hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Badge - floating pill at top-left */}
      {plan.badge && (
        <div className={cn("absolute top-3 left-4 z-10 rounded-full px-3 py-1 text-xs font-semibold shadow-sm", badgeColorClass)}>
          {plan.badge}
        </div>
      )}

      {/* Food image — natural display, centered, no clip */}
      <div className="flex justify-center px-6 pt-10 pb-4 relative h-44 w-44 mx-auto">
        <Image
          src={imageSrc}
          alt={plan.name}
          fill
          className="object-contain drop-shadow-md"
          sizes="(max-width: 768px) 176px, 176px"
          onError={() => setImageLoadFailed(true)}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        <h3 className="text-xl font-black text-primary">{plan.name}</h3>
        {plan.description && (
          <p className="mt-1 line-clamp-2 text-sm font-normal text-muted-foreground">{plan.description}</p>
        )}

        <hr className="my-4 border-border" />

        {/* Stats row */}
        <div className="flex items-center gap-5 text-sm text-foreground">
          <div className="flex items-center gap-1.5">
            <FaClock className="h-4 w-4 text-foreground" />
            <span>{isWeekly ? "7 days" : "30 days"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaFire className="h-4 w-4 text-foreground" />
            <span>{mealsPerDay} meals/day</span>
          </div>
        </div>

        {/* Price */}
        <div className="mt-4">
          <span className="text-sm text-primary">From</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold text-primary">
              {currencyFormatter.format(plan.price)}
            </span>
            <span className="text-sm font-medium text-primary">/{periodLabel}</span>
          </div>
        </div>

        {/* Start Plan button */}
        <Button
          type="button"
          className="mt-5 h-12 w-full rounded-full bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
          onClick={handleSelectPlan}
        >
          Start Plan
        </Button>

        {/* View meal link */}
        <button
          type="button"
          onClick={handleViewMenu}
          className="mt-2.5 text-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ⓘ View meal
        </button>
      </div>
    </article>
  );
}
