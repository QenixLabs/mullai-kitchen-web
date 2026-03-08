import { FaCalendar, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { Info, Wallet, Loader2, ArrowRight, Lock, Shield } from "lucide-react";
import type { PricingBreakdown } from "@/lib/checkout-config";

interface OrderSummaryProps {
  planName: string;
  planDuration: string;
  pricing: PricingBreakdown;
  applyWallet: boolean;
  isProcessing: boolean;
  onPay: () => void;
}

export function OrderSummary({
  planName,
  planDuration,
  pricing,
  applyWallet,
  isProcessing,
  onPay,
}: OrderSummaryProps) {
  const {
    subtotal,
    optOutDiscount,
    deliveryCharge,
    taxes,
    amountAfterWallet,
    walletReservation,
  } = pricing;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-4 text-base font-bold text-gray-900">Order Summary</h3>

      <div className="space-y-3 text-sm">
        {/* Plan row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-gray-800">Monthly Subscription Plan</p>
            <p className="text-xs text-gray-500">
              {planName} ({planDuration})
            </p>
          </div>
          <span className="shrink-0 font-semibold text-gray-900">
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        {/* Opt-Out Discount */}
        {optOutDiscount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span className="flex items-center gap-1">
              <FaCalendar className="h-3 w-3" />
              Opt-Out Discount
            </span>
            <span className="font-medium">-₹{optOutDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* Delivery Fee */}
        <div className="flex items-center justify-between text-gray-600">
          <span className="flex items-center gap-1">
            Delivery Fee
            <Info className="h-3 w-3 text-muted-foreground" />
          </span>
          <span className="font-medium text-gray-800">₹{deliveryCharge.toFixed(2)}</span>
        </div>

        {/* Taxes */}
        <div className="flex items-center justify-between text-gray-600">
          <span>Estimated Taxes</span>
          <span className="font-medium text-gray-800">₹{taxes.toFixed(2)}</span>
        </div>

        {/* Wallet Applied */}
        {applyWallet && walletReservation > 0 && (
          <div className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Wallet Applied
            </span>
            <span className="font-medium">-₹{walletReservation.toFixed(2)}</span>
          </div>
        )}

        <div className="h-px bg-gray-100" />

        {/* Total */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {applyWallet && walletReservation > 0 ? "You're Paying" : "Total to Reserve"}
          </p>
          <div className="flex items-end justify-between">
            <p className="mt-0.5 text-3xl font-extrabold text-gray-900">
              ₹{amountAfterWallet.toFixed(2)}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onPay}
          disabled={isProcessing}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-primary transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay & Subscribe
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Secure
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> PCI-DSS
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> 256-BIT
          </span>
        </div>
      </div>
    </div>
  );
}
