"use client";

import { useCallback, useEffect } from "react";
import { FaCreditCard, FaCalendar } from "react-icons/fa";
import { CreditCard, QrCode, MapPin } from "lucide-react";
import { addDays } from "date-fns";
import { toast } from "sonner";

import { useCurrentUser } from "@/hooks/useUserStore";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useCheckout } from "@/hooks/useCheckout";
import { useCreateAddress } from "@/api/hooks/useCreateAddress";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { CHECKOUT_CONFIG, PAYMENT_METHODS } from "@/lib/checkout-config";
import { DatePicker } from "@/components/ui/date-picker";

import { StepIndicator } from "@/components/customer/checkout/StepIndicator";
import { PaymentOption } from "@/components/customer/checkout/PaymentOption";
import { OptOutSummary } from "@/components/customer/checkout/OptOutSummary";
import { OrderSummary } from "@/components/customer/checkout/OrderSummary";
import { WalletBanner } from "@/components/customer/checkout/WalletBanner";
import { WalletDisplay } from "@/components/customer/checkout/WalletDisplay";
import { HelpChat } from "@/components/customer/checkout/HelpChat";
import { CheckoutDialogs } from "@/components/customer/checkout/CheckoutDialogs";
import { CouponSelector } from "@/components/customer/checkout/CouponSelector";
import { MealTypeSelector } from "@/components/customer/checkout/MealTypeSelector";
import type { MealType } from "@/stores/plan-intent-store";

export default function CheckoutPage() {
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
    addressesLoading,
    walletBalance,
    walletLoading,
    walletError,
    refetchWallet,
    paymentStatus,
    createOrderMutation,
    state,
    pricing,
    handleStartDateChange,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentDismissed,
    setSelectedPayment,
    setApplyWallet,
    setOptOutDates,
    toggleAddressDialog,
    toggleWalletInfo,
    toggleOptOutDialog,
    setAppliedCoupon,
    previewPricingMutation,
    setSelectedMealType,
    setMealAddressMapping,
    getMealAddressMapping,
  } = useCheckout();

  // Show toast when pricing preview fails
  useEffect(() => {
    if (previewPricingMutation.error) {
      const errorMessage =
        typeof previewPricingMutation.error === 'object' &&
        previewPricingMutation.error !== null &&
        'message' in previewPricingMutation.error
          ? (previewPricingMutation.error as { message: string }).message
          : 'Failed to load pricing information';
      toast.error('Pricing Error', {
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
    });

    // Format dates as YYYY-MM-DD to avoid timezone issues
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
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
        meal_address_mappings: state.mealAddressMappings.length > 0 ? state.mealAddressMappings : undefined,
      });

      paymentStore.setPaymentProcessing(result);

      if (result.amount === 0) {
        handlePaymentSuccess({
          razorpay_payment_id: "WALLET_PAYMENT",
          razorpay_order_id: result.order_id,
          razorpay_signature: "WALLET_SUCCESS",
        });
        return;
      }

      openRazorpayCheckout({
        keyId: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: CHECKOUT_CONFIG.companyName,
        description: `${plan?.name || "Subscription"} - ${plan?.duration || ""}`,
        orderId: result.razorpayOrderId,
        onSuccess: handlePaymentSuccess,
        onFailure: handlePaymentFailure,
        onDismiss: handlePaymentDismissed,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },
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
    plan?.duration,
    user?.name,
    user?.email,
    user?.phone,
    paymentStore,
    createOrderMutation,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentDismissed,
    state.appliedCoupon?.couponId,
  ]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-gray-500">Preparing your checkout session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-gray-500">Redirecting to sign in…</p>
      </div>
    );
  }

  if (!hasPlanIntent || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-gray-500">Redirecting to plans…</p>
      </div>
    );
  }

  const isProcessing = paymentStatus === "processing" || createOrderMutation.isPending;
  const canUseCardOrUPI = !(
    state.applyWallet &&
    walletBalance !== null &&
    walletBalance >= pricing.total
  );

  // Extract available meal types from plan
  const availableMealTypes: MealType[] = plan?.meals_included
    ? plan.meals_included
        .map((meal) => {
          const normalized = meal.toLowerCase();
          if (normalized.includes("breakfast")) return "Breakfast";
          if (normalized.includes("lunch")) return "Lunch";
          if (normalized.includes("dinner")) return "Dinner";
          return null;
        })
        .filter((m): m is MealType => m !== null)
    : [];


  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-0">
          <StepIndicator step={1} label="Delivery Details" active />
          <div className="mx-3 h-0.5 w-24 bg-linear-to-r from-border to-border sm:w-40" />
          <StepIndicator step={2} label="Payment & Review" active={isProcessing} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-5">
            {/* Meal Type Selection with Integrated Address Selection */}
            <section className="rounded-sm border border-border bg-card p-5 shadow-md sm:p-6">
              <MealTypeSelector
                availableMealTypes={availableMealTypes}
                selectedMealType={state.selectedMealType}
                onMealTypeChange={(mealType) => {
                  setSelectedMealType(mealType);
                  // If this meal type doesn't have an address mapping yet, set it to default
                  const existingMapping = getMealAddressMapping(mealType);
                  if (!existingMapping && state.selectedAddressId) {
                    setMealAddressMapping(mealType, state.selectedAddressId);
                  }
                }}
                disabled={isProcessing}
                addresses={addresses || []}
                addressesLoading={addressesLoading}
                defaultAddressId={state.selectedAddressId}
                mealAddressMappings={state.mealAddressMappings}
                onAddressChange={setMealAddressMapping}
                onAddNewAddress={() => toggleAddressDialog(true)}
              />
            </section>

            {/* Subscription Details */}
            <section className="rounded-sm border border-border bg-card p-5 shadow-md sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
                <FaCalendar className="h-5 w-5 text-primary" />
                Subscription Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FaCalendar className="h-4 w-4 text-primary" />
                    Subscription Start Date
                  </label>
                  <DatePicker
                    date={state.startDate}
                    onDateChange={handleStartDateChange}
                    placeholder="Select start date"
                    minDate={addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday)}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Subscriptions start at least {CHECKOUT_CONFIG.minDaysFromToday} day(s) from today
                  </p>
                </div>

                <OptOutSummary
                  optOutDates={state.optOutDates}
                  optOutDiscount={pricing.optOutDiscount}
                  perDayPrice={pricing.perDayPrice}
                  maxOptOutDays={pricing.maxOptOutDays}
                  onClear={() => setOptOutDates([])}
                  onModify={() => toggleOptOutDialog(true)}
                />
              </div>
            </section>

            {/* Coupon Selector */}
            <CouponSelector
              orderType="SUBSCRIPTION"
              orderAmount={pricing.discountedSubtotal}
              planId={planId || undefined}
              appliedCoupon={state.appliedCoupon}
              onCouponApply={setAppliedCoupon}
            />

            <WalletBanner onLearnMore={() => toggleWalletInfo(true)} />

            <section className="rounded-sm border border-border bg-card p-5 shadow-md sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
                <FaCreditCard className="h-5 w-5 text-primary" />
                Payment Selection
              </h2>

              <WalletDisplay
                walletBalance={walletBalance}
                walletLoading={walletLoading}
                walletError={walletError}
                applyWallet={state.applyWallet}
                walletReservation={pricing.walletReservation}
                onRetry={refetchWallet}
                onToggleApply={setApplyWallet}
              />

              <div className="space-y-3">
                <PaymentOption
                  id={PAYMENT_METHODS.WALLET}
                  label="Mullai Wallet + Card/UPI"
                  subtitle={
                    state.applyWallet && walletBalance !== null
                      ? `₹${pricing.walletReservation.toFixed(2)} reserved, ₹${pricing.amountAfterWallet.toFixed(2)} remaining`
                      : undefined
                  }
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <FaCreditCard className="h-4 w-4 text-foreground" />
                    </div>
                  }
                  selected={state.selectedPayment === PAYMENT_METHODS.WALLET}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.WALLET)}
                />

                <PaymentOption
                  id={PAYMENT_METHODS.CARD}
                  label="Credit / Debit Card"
                  disabled={!canUseCardOrUPI}
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                  }
                  selected={state.selectedPayment === PAYMENT_METHODS.CARD}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.CARD)}
                />

                <PaymentOption
                  id={PAYMENT_METHODS.UPI}
                  label="UPI (PhonePe, GPay, etc.)"
                  disabled={!canUseCardOrUPI}
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <QrCode className="h-4 w-4 text-gray-500" />
                    </div>
                  }
                  selected={state.selectedPayment === PAYMENT_METHODS.UPI}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.UPI)}
                />
              </div>
            </section>
          </div>

          <div className="w-full space-y-4 lg:w-72 xl:w-80">
            <OrderSummary
              planName={plan.name}
              planDuration={plan.duration}
              pricing={pricing}
              applyWallet={state.applyWallet}
              isProcessing={isProcessing}
              onPay={handlePay}
            />

            <HelpChat />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center rounded-sm border border-border bg-muted px-6 py-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-foreground" />
          <p className="text-sm font-semibold text-foreground">
            We deliver to selected serviceable pincodes. Enter your address
            during checkout to check availability.
          </p>
        </div>
      </div>

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
