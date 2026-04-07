"use client";

import { useState } from "react";
import Image from "next/image";
import { FaCheck, FaStar, FaCalendarAlt, FaClock, FaFire } from "react-icons/fa";

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

  const recommendedImage = "/images/plans/recommended%20meal.png";
  const bestValueImage = "/images/plans/best-value.png";
  const preferredImage = /best\s*-?\s*value|value/i.test(plan.badge ?? "")
    ? bestValueImage
    : recommendedImage;
  const fallbackImage = recommendedImage;
  const imageSrc = imageLoadFailed ? fallbackImage : preferredImage;
  const isFallback = imageSrc === fallbackImage;
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
      ? 'bg-primary text-white'
      : /recommend/i.test(plan.badge)
      ? 'bg-[#7C5A31] text-white'
      : /value|best/i.test(plan.badge)
      ? 'bg-[#0D4B37] text-white'
      : 'bg-primary text-white'
    : '';

  // Compact variant for mobile horizontal scroll
  if (variant === "compact") {
    return (
      <article
        className={cn(
          "group relative flex w-72 shrink-0 flex-col overflow-hidden rounded-3xl border border-[#E8E2E5] bg-[#FCFBFC]",
          "shadow-[0_2px_12px_rgba(20,15,17,0.06)]",
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
        <div className="relative mx-3 mt-3 h-36 overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={plan.name}
            fill
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              isFallback && "object-contain p-4"
            )}
            sizes="(max-width: 768px) 288px, 288px"
            onError={() => setImageLoadFailed(true)}
          />

          {/* Badge */}
          {plan.badge && (
            <Badge className={cn("absolute left-2 top-2 z-10 gap-1 border-0 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em]", badgeColorClass)}>
              <FaStar className="h-2.5 w-2.5" />
              {plan.badge}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 pt-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3
              className="line-clamp-2 text-[20px] font-bold leading-tight text-[#261217]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {plan.name}
            </h3>
            <div className="shrink-0 text-right">
              <div
                className="text-[20px] font-bold leading-none text-primary"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {currencyFormatter.format(plan.price)}
              </div>
              <div
                className="text-[12px] font-semibold text-[#6E6467]"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                /{periodLabel}
              </div>
            </div>
          </div>

          {/* Meals - horizontal scroll */}
          <div className="mb-4 flex items-center gap-3 text-[#5F5458]">
            <span className="inline-flex items-center gap-1">
              <FaCalendarAlt className="h-3 w-3" />
              <span
                className="text-[12px] font-semibold"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {isWeekly ? "7 Days" : "30 Days"}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <FaFire className="h-3 w-3" />
              <span
                className="text-[12px] font-bold"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {mealsPerDay} meals/day
              </span>
            </span>
          </div>

          {/* CTA - Simple Get Started */}
          <Button
            type="button"
            className={cn(
              "mt-auto h-10 rounded-full bg-primary font-semibold text-white transition-all duration-300",
              "hover:bg-primary/90",
              "active:scale-[0.98]"
            )}
            onClick={handleSelectPlan}
          >
            Start Plan
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleViewMenu}
            className="mt-2.5 h-auto text-center text-xs font-semibold text-[#6E6467] transition-colors hover:text-primary"
          >
            View meal
          </Button>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article
          className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border border-[#E8E2E5] bg-[#FCFBFC] transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,15,17,0.08)]",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className
      )}
    >
      {/* Badge - floating pill at top-left */}
      {plan.badge && (
        <div className={cn("absolute left-5 top-5 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm", badgeColorClass)}>
          {plan.badge}
        </div>
      )}

      {/* Food image */}
      <div className="relative mx-4 mt-4 h-42.5 overflow-hidden rounded-2xl">
        <Image
          src={imageSrc}
          alt={plan.name}
          fill
          className={cn(
            "object-cover transition-transform duration-500 hover:scale-[1.02]",
            isFallback && "object-contain p-4",
          )}
          sizes="(max-width: 768px) 100vw, 420px"
          onError={() => setImageLoadFailed(true)}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3
            className="line-clamp-2 text-[20px] font-bold leading-[1.2] text-[#2A1216]"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {plan.name}
          </h3>
          <div className="shrink-0 text-right">
            <div
              className="text-[20px] font-bold leading-none text-primary"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {currencyFormatter.format(plan.price)}
            </div>
            <div
              className="mt-0.5 text-[12px] font-semibold text-[#6E6467]"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              /{periodLabel}
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-4 text-[#5F5458]">
          <div className="flex items-center gap-1.5">
            <FaClock className="h-3.5 w-3.5 text-[#7A6F73]" />
            <span
              className="text-[12px] font-semibold"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {isWeekly ? "7 Days" : "30 Days"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaFire className="h-3.5 w-3.5 text-[#7A6F73]" />
            <span
              className="text-[12px] font-bold"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {mealsPerDay} meals/day
            </span>
          </div>
        </div>

        {/* Start Plan button */}
        <Button
          type="button"
          className="mt-auto h-11 w-full rounded-full bg-primary text-sm font-bold text-white hover:bg-primary/90 active:scale-[0.98]"
          onClick={handleSelectPlan}
        >
          Start Plan
        </Button>

        {/* View meal link */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleViewMenu}
          className="mt-2.5 h-auto text-center text-xs font-semibold text-[#6E6467] transition-colors hover:text-primary"
        >
          View meal
        </Button>
      </div>
    </article>
  );
}
