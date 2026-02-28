import { AlertCircle, CreditCard, Plus, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";

import { useWalletBalance } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface WalletBalanceCardProps {
  className?: string;
  showRefresh?: boolean;
  onAddFunds?: () => void;
}

export function WalletBalanceCard({
  className,
  showRefresh = true,
  onAddFunds,
}: WalletBalanceCardProps) {
  const { data, isLoading, error, refetch, isFetching } = useWalletBalance();

  const balance = data?.balance ?? null;
  const currency = data?.currency ?? "INR";
  const refreshing = isFetching && !isLoading;
  const hasError = error !== null;

  const handleRefresh = () => {
    refetch();
  };

  const currencySymbol = currency === "INR" ? "₹" : "$";
  const hasBalance = balance !== null && balance > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-sm border bg-white shadow-sm",
        hasBalance ? "border-emerald-200" : "border-gray-200",
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b p-5",
          hasBalance ? "border-emerald-100 bg-emerald-50/50" : "border-gray-100",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              hasBalance ? "bg-emerald-100" : "bg-gray-100",
            )}
          >
            <Wallet className={cn("h-5 w-5", hasBalance ? "text-emerald-600" : "text-muted-foreground")} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Wallet Balance</h3>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </div>
        </div>

        {showRefresh && !isLoading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </Button>
        )}
      </div>

      {/* Balance Display */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : hasError ? (
          <div className="flex items-center gap-3 rounded-sm border border-red-100 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-900">Failed to load wallet balance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main Balance */}
            <div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">Available Balance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-foreground">
                  {currencySymbol}
                </span>
                <span className="text-4xl font-extrabold text-foreground">
                  {balance !== null ? balance.toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={onAddFunds}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Funds
            </Button>

            {/* Quick Info */}
            {balance !== null && balance > 0 && (
              <div className="flex items-start gap-2 rounded-sm border border-blue-50 bg-blue-50 p-3">
                <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs text-foreground">
                  Your wallet balance can be used for subscriptions, add-on orders,
                  and meal plan purchases. Funds are automatically deducted at the
                  time of payment.
                </p>
              </div>
            )}

            {/* Zero Balance Info */}
            {balance === 0 && (
              <div className="flex items-start gap-2 rounded-sm border border-primary/20 bg-primary/10 p-3">
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-xs text-foreground">
                  Your wallet is empty. Add funds to take advantage of wallet-based
                  payments and earn rewards on every top-up!
                </p>
              </div>
            )}

            {/* High Balance Info */}
            {balance !== null && balance >= 1000 && (
              <div className="flex items-start gap-2 rounded-sm border border-emerald-100 bg-emerald-50 p-3">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <p className="text-xs text-foreground">
                  Great! You have a healthy wallet balance. Your funds are secure
                  and ready to use for your next subscription or order.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
