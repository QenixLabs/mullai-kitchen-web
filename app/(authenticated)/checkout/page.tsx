"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  Wallet,
  CreditCard,
  QrCode,
  ChevronDown,
  Check,
  Utensils,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useUserStore";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useCheckout } from "@/hooks/useCheckout";
import { useCreateAddress } from "@/api/hooks/useCreateAddress";
import { loadZohoPaymentsScript, openZohoCheckout } from "@/lib/zoho-payments";
import { CHECKOUT_CONFIG, PAYMENT_METHODS } from "@/lib/checkout-config";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { CheckoutDialogs } from "@/components/customer/checkout/CheckoutDialogs";
import { GoogleMap } from "@/components/customer/profile/GoogleMap";

interface PaymentMethodOptionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  rightElement?: React.ReactNode;
}

function PaymentMethodOption({
  id: _id,
  title,
  subtitle,
  icon,
  selected,
  onClick,
  disabled,
  rightElement,
}: PaymentMethodOptionProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-200 text-left h-auto justify-start",
        selected
          ? "border-primary bg-[#E9D9DC] hover:bg-[#E9D9DC]"
          : "border-[#E8E1E4] bg-[#F8F2F3] hover:border-primary/30 hover:bg-[#F8F2F3]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors",
          selected ? "bg-primary text-white" : "bg-white text-[#797778]"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#2A1216] text-sm sm:text-base">{title}</p>
        {subtitle && <p className="text-sm text-[#797778]">{subtitle}</p>}
      </div>
      {rightElement}
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
          selected
            ? "border-primary bg-primary"
            : "border-[#D5CACE] bg-white"
        )}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </Button>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const createAddressMutation = useCreateAddress();
  const paymentStore = usePaymentStore();

  const {
    hasHydrated,
    isAuthenticated,
    hasPlanIntent,
    plan,
    planId,
    addresses,
    walletBalance,
    paymentStatus,
    createOrderMutation,
    state,
    pricing,
    handleStartDateChange,
    handlePaymentSuccess,
    handlePaymentFailure,
    setSelectedPayment,
    setOptOutDates,
    toggleAddressDialog,
    toggleWalletInfo,
    toggleOptOutDialog,
    previewPricingMutation,
  } = useCheckout();

  // Show toast when pricing preview fails
  useEffect(() => {
    if (previewPricingMutation.error) {
      const errorMessage =
        typeof previewPricingMutation.error === "object" &&
        previewPricingMutation.error !== null &&
        "message" in previewPricingMutation.error
          ? (previewPricingMutation.error as { message: string }).message
          : "Failed to load pricing information";
      toast.error("Pricing Error", {
        description: errorMessage,
      });
    }
  }, [previewPricingMutation.error]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handlePay = useCallback(async () => {
    if (!planId || !state.selectedAddressId) {
      toast.error("Incomplete Checkout", {
        description: "Please complete all checkout fields.",
      });
      return;
    }

    paymentStore.setPaymentProcessing({
      razorpayOrderId: "",
      keyId: "",
      amount: 0,
      currency: "INR",
      name: CHECKOUT_CONFIG.companyName,
      description: `${plan?.name || "Subscription"} Payment`,
      order_id: "",
      walletReservationAmount: 0,
      paymentSessionId: "",
      providerAccountId: "",
      provider: "zoho",
    });

    // Format dates as YYYY-MM-DD to avoid timezone issues
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    try {
      const result = await createOrderMutation.mutateAsync({
        plan_id: planId,
        address_id: state.selectedAddressId,
        start_date: formatDate(state.startDate),
        apply_wallet: state.applyWallet,
        opt_out_dates: state.optOutDates.map((d) => formatDate(d)),
        coupon_id: state.appliedCoupon?.couponId,
        meal_address_mappings:
          state.mealAddressMappings.length > 0
            ? state.mealAddressMappings
            : undefined,
      });

      paymentStore.setPaymentProcessing(result);

      if (result.amount === 0) {
        handlePaymentSuccess({
          payment_id: "WALLET_PAYMENT",
          payments_session_id: result.paymentSessionId,
          status: "paid",
        });
        return;
      }

      await loadZohoPaymentsScript();

      openZohoCheckout({
        accountId: result.providerAccountId,
        paymentSessionId: result.paymentSessionId,
        amount: result.amount,
        currency: result.currency,
        customer: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
        },
        description: result.description,
        invoiceNumber: result.order_id,
        onSuccess: handlePaymentSuccess,
        onFailure: handlePaymentFailure,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Payment failed. Please try again.";
      toast.error("Payment Failed", { description: errorMessage });
    }
  }, [
    planId,
    state.selectedAddressId,
    state.startDate,
    state.applyWallet,
    state.optOutDates,
    state.mealAddressMappings,
    plan?.name,
    user?.name,
    user?.email,
    user?.phone,
    paymentStore,
    createOrderMutation,
    handlePaymentSuccess,
    handlePaymentFailure,
    state.appliedCoupon?.couponId,
  ]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#797778]">Preparing your checkout session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-[#797778]">Redirecting to sign in...</p>
      </div>
    );
  }

  if (!hasPlanIntent || !plan) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <p className="text-[#797778]">Redirecting to plans...</p>
      </div>
    );
  }

  const isProcessing =
    paymentStatus === "processing" || createOrderMutation.isPending;
  const canUseCardOrUPI = !(
    state.applyWallet &&
    walletBalance !== null &&
    walletBalance >= pricing.total
  );

  // Get selected address
  const selectedAddress = addresses?.find(
    (a) => a._id === state.selectedAddressId
  );

  // Get map center from selected address or default
  const mapCenter = selectedAddress?.lat && selectedAddress?.lng
    ? { lat: selectedAddress.lat, lng: selectedAddress.lng }
    : { lat: 13.0827, lng: 80.2707 };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Checkout
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              Confirm your order. Review your meal plan and preferred delivery schedule.
            </p>
          </div>
          <Button
            type="button"
            variant="link"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 text-lg font-bold uppercase text-primary hover:text-primary/80 h-auto p-0"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Review Delivery Details */}
            <section>
              <h2 className="text-base sm:text-lg font-bold text-[#2A1216] mb-4 sm:mb-6">
                Review Delivery Details
              </h2>

              <div className="mb-6 rounded-[14px] border border-[#DCD3D7] bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(26,11,15,0.08)]">
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-2">
                      HOME ADDRESS
                    </p>
                    {selectedAddress ? (
                      <>
                        <p className="text-[#2A1216] font-medium">
                          {selectedAddress.full_address}
                        </p>
                        <p className="text-[#797778] text-sm">
                          {selectedAddress.area}, {selectedAddress.city} -{" "}
                          {selectedAddress.pincode}
                        </p>
                      </>
                    ) : (
                      <p className="text-[#797778]">
                        No address selected. Please add an address.
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAddressDialog(true)}
                      className="mt-4 h-10 w-full sm:w-auto rounded-full border-none text-[#44151C] bg-[#F3ECEF] hover:bg-[#E9D9DC] px-5"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Change Address
                    </Button>
                  </div>
                  {/* Map Preview */}
                  <div className="w-full lg:w-48 h-40 sm:h-44 lg:h-32 rounded-lg overflow-hidden shrink-0 border border-[#E8E1E4]">
                    <GoogleMap
                      center={mapCenter}
                      zoom={15}
                      height="h-full"
                      className="border-0"
                    />
                  </div>
                </div>
                <div className="my-6 h-px bg-[#E8E1E4]" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-3">
                      STARTING DATE
                    </p>
                    <div className="flex items-center gap-3 rounded-xl border border-[#E4DADD] bg-[#F8F2F3] px-3 py-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-[#44151C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <DatePicker
                          date={state.startDate}
                          onDateChange={handleStartDateChange}
                          placeholder="Select start date"
                          minDate={addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday)}
                          className="h-9 w-full border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-3">
                      SKIP DAYS PREFERENCE
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => toggleOptOutDialog(true)}
                      className="w-full flex items-center gap-3 rounded-xl border border-[#E4DADD] bg-[#F8F2F3] px-3 py-3 hover:bg-[#F0E8EB] transition-colors h-auto justify-start"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-[#44151C]" />
                      </div>
                      <div className="flex-1 text-left">
                        {state.optOutDates.length > 0 ? (
                          <span className="text-sm text-[#2A1216]">
                            {state.optOutDates.length} days skipped
                          </span>
                        ) : (
                          <span className="text-sm text-[#797778]">
                            Select skip days (optional)
                          </span>
                        )}
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Apply Coupon */}
            <section>
              <h2 className="text-base sm:text-lg font-bold text-[#2A1216] mb-4">
                Apply Coupon
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#797778]" />
                  <Input
                    placeholder="Enter coupon code"
                    className="pl-12 h-12 rounded-xl border-none focus:border-primary bg-[#F8F2F3] placeholder:text-[#797778]"
                  />
                </div>
                <Button className="h-12 w-full sm:w-auto px-8 rounded-xl bg-primary text-white hover:bg-primary/90">
                  Apply
                </Button>
              </div>
              <Button
                type="button"
                variant="link"
                className="mt-4 text-sm text-[#797778] hover:text-primary flex items-center gap-2 transition-colors h-auto p-0"
              >
                View available Coupons (3)
                <ChevronDown className="w-4 h-4" />
              </Button>
            </section>

            {/* Payment Selection */}
            <section>
              <h2 className="text-base sm:text-lg font-bold text-[#2A1216] mb-4 sm:mb-6">
                Payment Selection
              </h2>

              <div className="space-y-3">
                {/* Wallet Balance */}
                <PaymentMethodOption
                  id={PAYMENT_METHODS.WALLET}
                  title="Mullai Wallet Balance"
                  subtitle={`Available Balance: ₹${walletBalance?.toLocaleString("en-IN") || "0"}`}
                  icon={<Wallet className="w-5 h-5" />}
                  selected={state.selectedPayment === PAYMENT_METHODS.WALLET}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.WALLET)}
                  rightElement={
                    walletBalance ? (
                      <span className="font-bold text-[#2A1216]">
                        ₹{walletBalance.toLocaleString("en-IN")}
                      </span>
                    ) : undefined
                  }
                />

                {/* UPI */}
                <PaymentMethodOption
                  id={PAYMENT_METHODS.UPI}
                  title="UPI (GPay, PhonePe, etc.)"
                  subtitle="Instant authorization via mobile app"
                  icon={<QrCode className="w-5 h-5" />}
                  selected={state.selectedPayment === PAYMENT_METHODS.UPI}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.UPI)}
                  disabled={!canUseCardOrUPI}
                />

                {/* Cards */}
                <PaymentMethodOption
                  id={PAYMENT_METHODS.CARD}
                  title="Credit / Debit Cards"
                  subtitle="Visa, Mastercard, RuPay"
                  icon={<CreditCard className="w-5 h-5" />}
                  selected={state.selectedPayment === PAYMENT_METHODS.CARD}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.CARD)}
                  disabled={!canUseCardOrUPI}
                />
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl border border-[#E8E1E4] p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-[#2A1216] mb-5 sm:mb-6">
                Order Summary
              </h2>

              {/* Selected Plan */}
              <div className="mb-6">
                <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-2">
                  SELECTED PLAN
                </p>
                <h3 className="font-bold text-[#2A1216] mb-1">{plan.name}</h3>
                <p className="text-sm text-[#797778] flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Chef-curated {plan.meals_included.join(" & ")}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-[#797778]">Monthly Charge</span>
                  <span className="font-semibold text-[#2A1216]">
                    ₹{pricing.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#797778]">Plan Subtotal</span>
                  <span className="text-[#2A1216]">
                    ₹{pricing.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#797778]">Delivery Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#797778]">Taxes & GST (18%)</span>
                  <span className="text-[#2A1216]">
                    ₹{pricing.taxes.toLocaleString("en-IN")}
                  </span>
                </div>
                {pricing.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{pricing.couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#E8E1E4] pt-4 mb-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[#797778] uppercase tracking-wider">
                    SUB-TOTAL
                  </span>
                  <span className="text-2xl font-bold text-[#44151C]">
                    ₹{pricing.amountAfterWallet.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full h-12 sm:h-14 rounded-xl bg-primary text-white font-semibold text-base sm:text-lg hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Pay and Subscribe"
                )}
              </Button>

              {/* Terms */}
              <p className="mt-4 text-xs text-center text-[#797778] leading-relaxed">
                By proceeding, you agree to Mullai Elite&apos;s{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Subscription Refund Policy
                </a>
                . Your first meal arrives{" "}
                {format(state.startDate, "MMM do")}.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CheckoutDialogs
        showAddressDialog={state.showAddressDialog}
        showWalletInfo={state.showWalletInfo}
        showOptOutDialog={state.showOptOutDialog}
        startDate={state.startDate}
        subscriptionDays={pricing.subscriptionDays}
        optOutDates={state.optOutDates}
        maxOptOutDays={pricing.maxOptOutDays}
        perDayPrice={pricing.perDayPrice}
        createAddressMutation={createAddressMutation}
        onToggleAddressDialog={toggleAddressDialog}
        onToggleWalletInfo={toggleWalletInfo}
        onToggleOptOutDialog={toggleOptOutDialog}
        onOptOutDatesChange={setOptOutDates}
      />
    </div>
  );
}
