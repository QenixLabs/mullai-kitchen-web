"use client";

import React from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";
import { motion } from "motion/react";

import type { WalletTransaction } from "@/api/types/payment.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface TransactionHistoryProps {
  className?: string;
  data: { transactions: WalletTransaction[]; total: number } | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
  limit: number;
  onPageChange: (page: number) => void;
}

const TRANSACTION_CATEGORY_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  PAUSE_CREDIT: {
    label: "Pause Refund",
    description: "Refund for paused days in your subscription",
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
  RESERVATION_RELEASED: {
    label: "Reservation Released",
    description: "Wallet reservation released back to balance",
  },
  SUBSCRIPTION_CANCELLATION: {
    label: "Refund",
    description: "Refund for cancelled subscription",
  },
  SUBSCRIPTION_RENEWAL: {
    label: "Subscription Renewal",
    description: "Payment for subscription renewal",
  },
  REFERRAL_BONUS: {
    label: "Referral Bonus",
    description: "Bonus earned from referring friends",
  },
  PROMOTIONAL_CREDIT: {
    label: "Promotional Credit",
    description: "Bonus credit from promotions",
  },
  LOYALTY_BONUS: {
    label: "Loyalty Bonus",
    description: "Bonus earned for loyalty rewards",
  },
  REFUND_CREDIT: {
    label: "Refund Credit",
    description: "Credit from refunds",
  },
  FIRST_PURCHASE_BONUS: {
    label: "First Purchase Bonus",
    description: "Bonus for first purchase",
  },
  MANUAL_ADJUSTMENT: {
    label: "Manual Adjustment",
    description: "Manual adjustment by support",
  },
};

export function TransactionHistory({
  className,
  data,
  isLoading,
  isFetching,
  error,
  refetch: _refetch,
  limit: _limit,
  onPageChange: _onPageChange,
}: TransactionHistoryProps) {
  const transactions = data?.transactions ?? [];
  const refreshing = isFetching && !isLoading;
  const hasError = error !== null;

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
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
      <div className={cn("flex min-h-80 items-center justify-center rounded-[28px] border border-[#ECE7EA] bg-white", className)}>
        <FaSpinner className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex min-h-80 items-center justify-center rounded-[28px] border border-red-200 bg-red-50 p-8",
          className,
        )}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-900">
            Failed to load transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[28px] border border-[#ECE7EA] bg-white p-7 shadow-[0_10px_24px_rgba(20,15,17,0.07)]", className)}>
      <h2 className="text-[36px] font-black leading-[0.92] tracking-tight text-[#341117]">
        Recent
        <br />
        Activity
      </h2>

      {/* Transactions List */}
      {sortedTransactions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#E5DEE2] bg-[#FAF7F8] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FaCalendarAlt className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Transactions Yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">Your wallet transaction history will appear here once you start using it for payments.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {sortedTransactions.slice(0, 4).map((tx, index) => {
            const isCredit = tx.type === "CREDIT";
            // Normalize category for lookup (e.g. "Reservation Confirmed" -> "RESERVATION_CONFIRMED")
            const categoryKey = tx.category.toUpperCase().replace(/\s+/g, "_");
            const categoryInfo = TRANSACTION_CATEGORY_LABELS[categoryKey];

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 rounded-xl px-2 py-2"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                    isCredit
                      ? "bg-[#D8F0F1]"
                      : "bg-[#F6DFE3]",
                  )}
                >
                  {isCredit ? (
                    <FaArrowUp className="h-4 w-4 text-[#2B95A0]" />
                  ) : (
                    <FaArrowDown className="h-4 w-4 text-[#7A2D3C]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[22px] font-bold leading-tight text-[#28191D]">
                        {categoryInfo?.label || tx.category}
                      </p>
                      <p className="mt-1 text-sm text-[#7D7276]" title={formatFullDate(tx.createdAt)}>
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <p
                        className={cn(
                          "text-[28px] font-extrabold leading-none",
                          isCredit ? "text-[#2C95A0]" : "text-[#4E1020]",
                        )}
                      >
                        {isCredit ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A8D92]">
                        {isCredit ? "Success" : "Completed"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Button variant="outline" className="mt-7 h-11 w-full rounded-2xl border-[#E9E1E5] bg-white font-bold uppercase tracking-[0.12em] text-[#66585D] hover:bg-[#FAF7F8]">
        View Full History
      </Button>
    </div>
  );
}
