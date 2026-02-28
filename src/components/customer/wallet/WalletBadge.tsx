"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, TrendingUp, Plus } from "lucide-react";
import { motion } from "motion/react";

import { paymentApi } from "@/api/payment.api";
import type { WalletBalanceResponse } from "@/api/types/payment.types";
import { cn } from "@/lib/utils";

export interface WalletBadgeProps {
  className?: string;
  showAddFunds?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const SIZE_CLASSES = {
  sm: "text-xs py-1 px-2.5 gap-1.5",
  md: "text-sm py-1.5 px-3 gap-2",
  lg: "text-sm py-2 px-4 gap-2",
};

const ICON_SIZE = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function WalletBadge({
  className,
  showAddFunds = false,
  size = "md",
  onClick,
}: WalletBadgeProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showCreditIndicator, setShowCreditIndicator] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response: WalletBalanceResponse = await paymentApi.getWalletBalance();
        setBalance(response.balance);
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Simulate credit indicator for demo
    const timer = setTimeout(() => {
      if (balance > 0) {
        setShowCreditIndicator(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [balance]);

  const currencySymbol = "₹";
  const content = (
    <div
      className={cn(
        "flex items-center rounded-full border bg-white shadow-sm transition-all hover:shadow-md",
        SIZE_CLASSES[size],
        className,
      )}
    >
      <Wallet className={cn(ICON_SIZE[size], "text-primary")} />
      <span className="font-semibold text-foreground">
        {loading ? (
          <span className="animate-pulse">...</span>
        ) : (
          `${currencySymbol}${balance.toFixed(2)}`
        )}
      </span>
      {showAddFunds && <Plus className={cn(ICON_SIZE[size], "text-muted-foreground")} />}
      {showCreditIndicator && balance > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600"
        >
          <TrendingUp className="h-2.5 w-2.5" />
          <span>Active</span>
        </motion.div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {content}
      </button>
    );
  }

  return <Link href="/wallet">{content}</Link>;
}

/**
 * Compact wallet badge for navigation headers
 */
export function CompactWalletBadge({ className }: { className?: string }) {
  return (
    <WalletBadge
      size="sm"
      className={cn("border-border", className)}
    />
  );
}

/**
 * Large wallet badge with more prominence
 */
export function FeaturedWalletBadge({ className }: { className?: string }) {
  return (
    <WalletBadge
      size="lg"
      showAddFunds
      className={cn("border-primary/20 bg-primary/10", className)}
    />
  );
}
