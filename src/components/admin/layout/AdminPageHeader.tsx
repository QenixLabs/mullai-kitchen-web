"use client";

import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start",
        className
      )}
    >
      <div className="flex-1">
        <h1
          className="text-[36px] font-extrabold uppercase"
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#44151c",
            letterSpacing: "-0.9px",
            lineHeight: "40px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-1 text-base font-medium"
            style={{ color: "#554243", lineHeight: "24px" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex w-full flex-wrap shrink-0 items-center gap-3 sm:w-auto">{children}</div>
      )}
    </div>
  );
}
