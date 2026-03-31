import { useState } from "react";
import {
  FaExclamationCircle,
  FaMoneyBillWave,
  FaWallet,
  FaSyncAlt,
} from "react-icons/fa";
import { motion } from "motion/react";

import { useWalletBalance } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface WalletBalanceCardProps {
  className?: string;
  showRefresh?: boolean;
  onAddFunds?: (amount?: number) => void;
  isTopupProcessing?: boolean;
}

export function WalletBalanceCard({
  className,
  showRefresh = true,
  onAddFunds,
  isTopupProcessing = false,
}: WalletBalanceCardProps) {
  const { data, isLoading, error, refetch, isFetching } = useWalletBalance();
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState("");

  const balance = data?.balance ?? null;
  const currency = data?.currency ?? "INR";
  const refreshing = isFetching && !isLoading;
  const hasError = error !== null;

  const handleRefresh = () => {
    refetch();
  };

  const currencySymbol = currency === "INR" ? "₹" : "$";
  const handleProceed = () => {
    const parsed = Number(customAmount);
    if (customAmount.trim().length > 0 && Number.isFinite(parsed) && parsed > 0) {
      onAddFunds?.(parsed);
      return;
    }
    onAddFunds?.(selectedAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-5", className)}
    >
      <div className="rounded-[28px] bg-[#3D000C] p-6 text-white shadow-[0_18px_38px_rgba(39,0,8,0.35)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              Available Balance
            </p>
            {isLoading ? (
              <div className="mt-3 h-10 w-44 animate-pulse rounded-md bg-white/20" />
            ) : (
              <h3 className="mt-2 text-[52px] font-black leading-none">
                {currencySymbol}
                {balance !== null ? balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </h3>
            )}
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <FaWallet className="h-8 w-8 text-white/45" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-white/80">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
              Last Updated
            </p>
            <p className="mt-1 font-medium">{refreshing ? "Refreshing..." : "Just now"}</p>
          </div>

          {showRefresh && !isTopupProcessing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <FaSyncAlt className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[22px] border border-[#EEE7EA] bg-[#F7F3F5] p-6">
        <h4 className="text-[30px] font-black leading-none text-[#3A1118]">Add Funds</h4>
        <p className="mt-2 text-sm text-[#7C7074]">Quickly recharge your concierge wallet</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[2000, 5000, 10000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-bold transition-colors",
                selectedAmount === amount && customAmount === ""
                  ? "border-[#7D2E3B] bg-[#F1DDE2] text-[#4A111A]"
                  : "border-[#E7DDE1] bg-white text-[#352D31] hover:bg-[#FBF8F9]",
              )}
            >
              ₹{amount.toLocaleString("en-IN")}
            </button>
          ))}
        </div>

        <div className="mt-4 flex h-12 items-center justify-between rounded-xl border border-[#ECE2E6] bg-white px-4">
          <input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full bg-transparent text-sm font-medium text-[#3B3135] placeholder:text-[#9A8F94] outline-none"
          />
          <FaMoneyBillWave className="h-4 w-4 text-[#6D5E64]" />
        </div>

        {hasError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            <FaExclamationCircle className="h-3.5 w-3.5" />
            Failed to load wallet balance
          </div>
        )}

        <Button
          onClick={handleProceed}
          disabled={isTopupProcessing}
          className="mt-5 h-11 w-full rounded-full bg-[#4A0010] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#35000B]"
        >
          {isTopupProcessing ? (
            <span className="flex items-center gap-2">
              <FaSyncAlt className="h-4 w-4 animate-spin" />
              Processing
            </span>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>
    </motion.div>
  );
}
