"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ICorporateOrder } from "@/api/types/corporate.types";

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
    <div className="flex flex-col gap-4 mb-8">
      {/* Top row: Search + Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by order ID..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 rounded-xl h-10"
          />
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl">
            <ArrowUpDown className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bottom row: Status filter tabs */}
      <Tabs
        value={activeStatus}
        onValueChange={onStatusChange}
      >
        <TabsList className="h-10 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 px-3 text-sm whitespace-nowrap">
              {tab.label}
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1.5 text-[10px] font-semibold rounded-full"
              >
                {statusCounts[tab.value] ?? 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
