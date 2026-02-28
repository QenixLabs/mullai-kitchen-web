"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";

import { useWalletTransactions } from "@/api/hooks/usePayment";
import type { WalletTransaction } from "@/api/types/payment.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface TransactionHistoryProps {
  className?: string;
  limit?: number;
  showLoadMore?: boolean;
}

type SortOrder = "desc" | "asc";
type FilterType = "all" | "credit" | "debit";

const TRANSACTION_CATEGORY_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  PAUSE_CREDIT: {
    label: "Pause Refund",
    description:
      "Refund for paused days in your subscription",
  },
  SUBSCRIPTION_PURCHASE: {
    label: "Subscription",
    description: "Payment for new or renewed subscription",
  },
  ADDON_PURCHASE: {
    label: "Add-on Order",
    description: "Payment for additional menu items",
  },
  WALLET_TOPUP: {
    label: "Wallet Top-up",
    description: "Funds added to your wallet",
  },
  RESERVATION_CONFIRMED: {
    label: "Payment Confirmed",
    description: "Wallet reservation converted to actual payment",
  },
  SUBSCRIPTION_CANCELLATION: {
    label: "Refund",
    description:
      "Refund for cancelled subscription",
  },
};

export function TransactionHistory({
  className,
  limit = 10,
  showLoadMore = true,
}: TransactionHistoryProps) {
  const { data, isLoading, error, refetch, isFetching } = useWalletTransactions({ limit });

  const transactions = data?.transactions ?? [];
  const refreshing = isFetching && !isLoading;
  const hasError = error !== null;

  const [filter, setFilter] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const handleRefresh = () => {
    refetch();
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "credit") return tx.type === "CREDIT";
    if (filter === "debit") return tx.type === "DEBIT";
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !refreshing) {
    return (
      <div
        className={cn(
          "flex min-h-[300px] items-center justify-center",
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex min-h-[300px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8",
          className,
        )}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-900">Failed to load transactions</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="capitalize">{filter}</span>
              {showFilterDropdown ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showFilterDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <div className="p-1">
                  {(["all", "credit", "debit"] as FilterType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setFilter(type);
                        setShowFilterDropdown(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        filter === type
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      {type === "all" && <span>All Transactions</span>}
                      {type === "credit" && (
                        <>
                          <ArrowUp className="h-4 w-4 text-emerald-500" />
                          <span>Credits Only</span>
                        </>
                      )}
                      {type === "debit" && (
                        <>
                          <ArrowDown className="h-4 w-4 text-primary" />
                          <span>Debits Only</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sort Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            title="Sort by date"
          >
            {sortOrder === "desc" ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Transactions List */}
      {sortedTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Transactions Yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "all"
              ? "Your wallet transaction history will appear here once you start using it for payments."
              : `No ${filter} transactions found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map((tx, index) => {
            const isCredit = tx.type === "CREDIT";
            const categoryInfo = TRANSACTION_CATEGORY_LABELS[tx.category];

            return (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 rounded-xl border border-border bg-background p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isCredit
                      ? "bg-emerald-50 ring-1 ring-emerald-100"
                      : "bg-primary/10 ring-1 ring-primary/20",
                  )}
                >
                  {isCredit ? (
                    <ArrowUp className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-primary" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {categoryInfo?.label || tx.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {categoryInfo?.description || tx.description}
                      </p>
                      <p
                        className="mt-1 text-[11px] text-muted-foreground/70"
                        title={formatFullDate(tx.created_at)}
                      >
                        {formatDate(tx.created_at)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          isCredit ? "text-emerald-600" : "text-primary",
                        )}
                      >
                        {isCredit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {isCredit ? "Credited" : "Debited"}
                      </p>
                    </div>
                  </div>

                  {/* Balance change */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Balance:</span>
                    <span className="font-medium text-foreground">
                      ₹{tx.balance_before.toFixed(2)}
                    </span>
                    <ArrowDown className="h-3 w-3 text-muted-foreground/70" />
                    <ArrowUp className="h-3 w-3 text-muted-foreground/70" />
                    <span className="font-medium text-foreground">
                      ₹{tx.balance_after.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {showLoadMore && sortedTransactions.length > 0 && sortedTransactions.length >= limit && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="w-full sm:w-auto">
            Load More Transactions
          </Button>
        </div>
      )}
    </div>
  );
}
