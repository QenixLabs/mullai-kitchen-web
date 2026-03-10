"use client";

import { useState, useCallback, memo } from "react";
import {
  Ticket,
  X,
  Tag,
  CheckCircle2,
  CircleX,
  Loader2,
  ChevronDown,
  ChevronUp,
  Percent,
  IndianRupee,
} from "lucide-react";

import { useValidateCoupon, useAvailableCoupons } from "@/api/hooks/useCoupon";
import type { AvailableCoupon, CouponValidationResponse } from "@/api/types/coupon.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ===========================================
// Types
// ===========================================

export interface AppliedCoupon {
  code: string;
  couponId: string;
  discountAmount: number;
}

export interface CouponSelectorProps {
  orderType: "SUBSCRIPTION" | "ADDON";
  orderAmount: number;
  planId?: string;
  appliedCoupon: AppliedCoupon | null;
  onCouponApply: (coupon: AppliedCoupon | null) => void;
  className?: string;
}

// ===========================================
// Helper Functions
// ===========================================

function formatDiscount(coupon: AvailableCoupon): string {
  if (coupon.type === "PERCENTAGE") {
    return coupon.max_discount
      ? `${coupon.value}% off (max ₹${coupon.max_discount})`
      : `${coupon.value}% off`;
  }
  return `₹${coupon.value} off`;
}

function getCouponIcon(type: AvailableCoupon["type"]) {
  return type === "PERCENTAGE" ? (
    <Percent className="h-4 w-4" />
  ) : (
    <IndianRupee className="h-4 w-4" />
  );
}

// ===========================================
// Sub-components
// ===========================================

interface CouponCardProps {
  coupon: AvailableCoupon;
  onSelect: (code: string) => void;
  isLoading?: boolean;
}

const CouponCard = memo(function CouponCard({ coupon, onSelect, isLoading }: CouponCardProps) {
  const handleClick = useCallback(() => {
    onSelect(coupon.code);
  }, [coupon.code, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "flex w-full items-start gap-3 rounded-sm border p-4 text-left transition-all",
        "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {getCouponIcon(coupon.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground uppercase tracking-wide">
            {coupon.code}
          </span>
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            {coupon.type === "PERCENTAGE" ? "%" : "₹"}
          </span>
        </div>
        <p className="mt-0.5 text-sm font-medium text-primary">
          {formatDiscount(coupon)}
        </p>
        {coupon.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {coupon.description}
          </p>
        )}
      </div>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <span className="text-xs font-medium text-primary">Apply</span>
      )}
    </button>
  );
});

CouponCard.displayName = "CouponCard";

interface AppliedCouponBadgeProps {
  coupon: AppliedCoupon;
  onRemove: () => void;
}

const AppliedCouponBadge = memo(function AppliedCouponBadge({ coupon, onRemove }: AppliedCouponBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-sm border border-success/30 bg-success/10 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Coupon Applied!
          </p>
          <p className="text-xs text-muted-foreground">
            Code: <span className="font-medium uppercase">{coupon.code}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-success">
          -₹{coupon.discountAmount.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-success/20 hover:text-foreground transition-colors"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

AppliedCouponBadge.displayName = "AppliedCouponBadge";

// ===========================================
// Main Component
// ===========================================

export function CouponSelector({
  orderType,
  orderAmount,
  planId,
  appliedCoupon,
  onCouponApply,
  className,
}: CouponSelectorProps) {
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? "");
  const [showAvailable, setShowAvailable] = useState(false);
  const [validationResult, setValidationResult] = useState<CouponValidationResponse | null>(null);

  const validateCouponMutation = useValidateCoupon();
  const { data: couponsList, isLoading: loadingCoupons } = useAvailableCoupons({
    order_type: orderType,
    order_amount: orderAmount,
  });
  // Response interceptor unwraps { data, success, message } to just the data array
  const availableCoupons = Array.isArray(couponsList) ? couponsList : [];

  const validateAndApplyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidationResult(null);

    try {
      const result = await validateCouponMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        order_type: orderType,
        order_amount: orderAmount,
        plan_id: planId,
      });

      setValidationResult(result);

      if (result.valid && result.coupon_id) {
        const coupon: AppliedCoupon = {
          code: result.code,
          couponId: result.coupon_id,
          discountAmount: result.discount_amount,
        };
        onCouponApply(coupon);
        toast.success("Coupon applied successfully!", {
          description: `You saved ₹${result.discount_amount.toFixed(2)}`,
        });
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to validate coupon";
      toast.error(message);
    }
  }, [orderType, orderAmount, planId, onCouponApply, validateCouponMutation]);

  const handleValidateCoupon = useCallback(() => {
    validateAndApplyCoupon(couponCode);
  }, [couponCode, validateAndApplyCoupon]);

  const handleRemoveCoupon = useCallback(() => {
    setValidationResult(null);
    setCouponCode("");
    onCouponApply(null);
    toast.info("Coupon removed");
  }, [onCouponApply]);

  const handleSelectAvailableCoupon = useCallback((code: string) => {
    setCouponCode(code);
    // Auto-validate when selecting from available list
    validateAndApplyCoupon(code);
  }, [validateAndApplyCoupon]);

  // Don't show if order amount is 0
  if (orderAmount <= 0) {
    return null;
  }

  // Show applied coupon state
  if (appliedCoupon) {
    return (
      <section className={cn("rounded-sm border border-border bg-card p-5 shadow-md sm:p-6", className)}>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
          <Tag className="h-5 w-5 text-primary" />
          Coupon Applied
        </h2>
        <AppliedCouponBadge coupon={appliedCoupon} onRemove={handleRemoveCoupon} />
      </section>
    );
  }

  const hasAvailableCoupons = availableCoupons && availableCoupons.length > 0;

  return (
      <section className={cn("rounded-sm border border-border bg-card p-5 shadow-md sm:p-6", className)}>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
          <Ticket className="h-5 w-5 text-primary" />
          Apply Coupon
        </h2>

      {/* Coupon Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter coupon code (e.g., WELCOME50)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleValidateCoupon();
                }
              }}
              className={cn(
                "h-12 rounded-sm border-input text-sm uppercase tracking-wide placeholder:normal-case",
                validationResult && !validationResult.valid && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={validateCouponMutation.isPending}
            />
            {couponCode && (
              <button
                type="button"
                onClick={() => setCouponCode("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleValidateCoupon}
            disabled={validateCouponMutation.isPending || !couponCode.trim()}
            className="h-12 px-6 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {validateCouponMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>

        {/* Validation Error */}
        {validationResult && !validationResult.valid && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <CircleX className="h-4 w-4 shrink-0" />
            <span>{validationResult.message || "Invalid coupon code"}</span>
          </div>
        )}
      </div>

      {/* Available Coupons Section */}
      {hasAvailableCoupons && (
        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowAvailable(!showAvailable)}
            className="flex w-full items-center justify-between text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>View available coupons ({availableCoupons.length})</span>
            {showAvailable ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAvailable && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {loadingCoupons ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                availableCoupons.map((coupon: AvailableCoupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    onSelect={handleSelectAvailableCoupon}
                    isLoading={
                      validateCouponMutation.isPending && couponCode === coupon.code
                    }
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

CouponSelector.displayName = "CouponSelector";
