"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ICorporateOrder } from "@/api/types/corporate.types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  orders: ICorporateOrder[];
}

// Status tab definitions
const STATUS_TABS: { value: string; label: string; filter: (order: ICorporateOrder) => boolean }[] = [
  {
    value: "all",
    label: "All",
    filter: () => true,
  },
  {
    value: "active",
    label: "Active",
    filter: (order) => order.status === "active",
  },
  {
    value: "pending_payment",
    label: "Pending Payment",
    filter: (order) => order.status === "pending_payment",
  },
  {
    value: "completed",
    label: "Completed",
    filter: (order) => order.status === "completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    filter: (order) => order.status === "cancelled",
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_high", label: "Amount: High-Low" },
  { value: "amount_low", label: "Amount: Low-High" },
];

export function OrderFilters({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  orders,
}: OrderFiltersProps) {
  // Internal debounced search state
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Compute counts for each status tab
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    STATUS_TABS.forEach((tab) => {
      if (tab.value !== "all") {
        counts[tab.value] = orders.filter(tab.filter).length;
      }
    });
    return counts;
  }, [orders]);

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Top row: Search + Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search by order ID, company or items..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-2xl border-border bg-card/50 backdrop-blur-sm focus-visible:ring-primary/20 focus-visible:border-primary transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full md:w-[200px] h-12 rounded-2xl bg-card border-border shadow-sm hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg my-0.5">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottom row: Status filter tabs */}
      <div className="relative">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-secondary/50 backdrop-blur-sm w-fit max-w-full overflow-x-auto no-scrollbar border border-border/50">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.value;
            const count = statusCounts[tab.value] ?? 0;

            return (
              <button
                key={tab.value}
                onClick={() => onStatusChange(tab.value)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap outline-none",
                  isActive 
                    ? "text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                {/* Active Background Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>

                {/* Content */}
                <span className="relative z-10">{tab.label}</span>
                {count > 0 && (
                  <motion.span
                    initial={false}
                    animate={{ 
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.05)",
                      color: isActive ? "white" : "inherit"
                    }}
                    className="relative z-10 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full transition-colors"
                  >
                    {count}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
