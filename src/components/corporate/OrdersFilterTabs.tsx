"use client";

import { cn } from "@/lib/utils";

interface OrdersFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    active: number;
    pendingPayment: number;
    processing: number;
    completed: number;
  };
}

const TABS = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "pending_payment", label: "Pending Payment" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
] as const;

export function OrdersFilterTabs({ activeTab, onTabChange, counts }: OrdersFilterTabsProps) {
  const getCount = (id: string) => {
    switch (id) {
      case "all":
        return counts.all;
      case "active":
        return counts.active;
      case "pending_payment":
        return counts.pendingPayment;
      case "processing":
        return counts.processing;
      case "completed":
        return counts.completed;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const count = getCount(tab.id);
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-[#F2ECED] text-[#39070F] hover:bg-[#E5DEDF]"
            )}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
