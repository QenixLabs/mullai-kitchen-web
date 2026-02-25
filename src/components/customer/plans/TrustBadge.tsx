"use client";

import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: LucideIcon;
  text: string;
  className?: string;
}

export function TrustBadge({ icon: Icon, text, className }: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-sm text-gray-600",
        className,
      )}
    >
      <Icon className="w-4 h-4 text-[#FF6B35]" strokeWidth={2} />
      <span className="font-medium">{text}</span>
    </div>
  );
}
