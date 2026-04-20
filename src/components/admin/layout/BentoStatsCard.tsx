"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BentoStatsCardProps {
  label: string;
  value: string | number | React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  iconNode?: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export function BentoStatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconNode,
  className,
  variant = "default",
}: BentoStatsCardProps) {
  const variantStyles = {
    default: "bg-white border border-[rgba(219,192,193,0.2)]",
    primary: "bg-primary text-white",
    success: "bg-white border-l-4 border-l-green-500",
    warning: "bg-white border-l-4 border-l-amber-500",
  };

  const valueColor =
    variant === "primary"
      ? "text-white"
      : variant === "success"
        ? "text-green-600"
        : variant === "warning"
          ? "text-amber-600"
          : "text-[#3d000c]";

  const labelColor =
    variant === "primary" ? "text-white/80" : "text-[#554243]";

  const subtitleColor =
    variant === "primary" ? "text-white/70" : "text-[#554243]/70";

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-3xl p-6",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-[1.2px]",
            labelColor
          )}
          style={{ lineHeight: "16px" }}
        >
          {label}
        </span>
        {(Icon || iconNode) && (
          <div className="shrink-0">
            {Icon ? (
              <Icon
                className={cn(
                  "h-5 w-5",
                  variant === "primary" ? "text-white/60" : "text-[#554243]/40"
                )}
              />
            ) : (
              iconNode
            )}
          </div>
        )}
      </div>
      <div className="mt-4">
        <div
          className={cn("text-2xl font-bold sm:text-[30px]", valueColor)}
          style={{ lineHeight: "1.2" }}
        >
          {value}
        </div>
        {subtitle && (
          <p className={cn("mt-1 text-xs font-medium", subtitleColor)}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
