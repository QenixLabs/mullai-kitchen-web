"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { toast } from "sonner";

import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { usePaymentStore } from "@/hooks/use-payment-store";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { useAddressList } from "@/api/hooks/useAddress";
import { usePreviewPricing, useWalletBalance, useCreateOrder } from "@/api/hooks/usePayment";
import { loadRazorpayScript } from "@/lib/razorpay";

import {
  CHECKOUT_CONFIG,
  PAYMENT_METHODS,
  type PaymentMethod,
  type PricingBreakdown,
  type CheckoutState,
} from "./types";

export function useCheckout() {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  
  const planId = usePlanIntentStore((s) => s.planId);
  const plan = usePlanIntentStore((s) => s.plan);
  const hasPlanIntent = Boolean(planId && plan);
  
  const paymentStore = usePaymentStore();
  const { status: paymentStatus } = paymentStore;

  const { data: addresses, isLoading: addressesLoading } = useAddressList();
  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useWalletBalance();

  const walletBalance = walletData?.balance ?? null;
  const createOrderMutation = useCreateOrder();
  const previewPricingMutation = usePreviewPricing();

  // Consolidated state
  const [state, setState] = useState<CheckoutState>({
    selectedAddressId: null,
    selectedPayment: PAYMENT_METHODS.WALLET,
    applyWallet: true,
    startDate: addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday),
    optOutDates: [],
    showAddressDialog: false,
    showWalletInfo: false,
    showOptOutDialog: false,
  });

  // Derived values
  const subscriptionDays = useMemo(() => {
    const durationMatch = plan?.duration?.match(/\d+/);
    return durationMatch ? parseInt(durationMatch[0], 10) : 30;
  }, [plan?.duration]);

  const maxOptOutDays = useMemo(
    () => Math.floor(subscriptionDays * 0.5),
    [subscriptionDays]
  );

  const perDayPrice = useMemo(() => {
    if (!plan?.price || subscriptionDays <= 0) return 0;
    return plan.price / subscriptionDays;
  }, [plan?.price, subscriptionDays]);

  const optOutDiscount = useMemo(
    () => state.optOutDates.length * perDayPrice,
    [state.optOutDates.length, perDayPrice]
  );

  // Pricing calculations with useMemo
  const pricing: PricingBreakdown = useMemo(() => {
    const subtotal = plan?.price ?? 0;
    const discountedSubtotal = Math.max(0, subtotal - optOutDiscount);
    
    const previewData = previewPricingMutation.data;
    const deliveryCharge = previewData?.deliveryCharge ?? 30;
    const taxes = previewData?.tax ?? parseFloat((discountedSubtotal * 0.05).toFixed(2));
    const total = previewData?.total ?? (discountedSubtotal + deliveryCharge + taxes);

    const walletReservation =
      state.applyWallet && walletBalance !== null ? Math.min(walletBalance, total) : 0;
    const amountAfterWallet =
      state.applyWallet && walletBalance !== null ? Math.max(0, total - walletBalance) : total;

    return {
      subtotal,
      optOutDiscount,
      discountedSubtotal,
      deliveryCharge,
      taxes,
      total,
      amountAfterWallet,
      walletReservation,
      perDayPrice,
      subscriptionDays,
      maxOptOutDays,
    };
  }, [
    plan?.price,
    optOutDiscount,
    previewPricingMutation.data,
    state.applyWallet,
    walletBalance,
    perDayPrice,
    subscriptionDays,
    maxOptOutDays,
  ]);

  // Reset payment store once on mount (not on every store change)
  useEffect(() => {
    paymentStore.resetPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize start date once on mount
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      startDate: addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday),
    }));
  }, []);

  useEffect(() => {
    if (addresses?.length && !state.selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
      if (defaultAddr) {
        setState((prev) => ({ ...prev, selectedAddressId: defaultAddr._id }));
      }
    }
  }, [addresses, state.selectedAddressId]);

  useEffect(() => {
    loadRazorpayScript().catch((err) => {
      console.error("Failed to load Razorpay script:", err);
      toast.error("System Error", {
        description: "Failed to load payment system. Please refresh and try again.",
      });
    });
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/signin?redirect=/checkout");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && !hasPlanIntent) {
      router.replace("/plans");
    }
  }, [hasHydrated, hasPlanIntent, isAuthenticated, router]);

  // Fetch preview pricing when dependencies change
  const { mutate: mutatePreviewPricing } = previewPricingMutation;
  
  useEffect(() => {
    // Only fetch when we have all required data
    if (!plan?._id || !state.selectedAddressId) return;

    // Ensure start date is at least 1 day from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = addDays(today, CHECKOUT_CONFIG.minDaysFromToday);

    if (state.startDate < minDate) {
      // Don't make the API call with invalid date
      return;
    }

    const previewData = {
      plan_id: plan._id,
      address_id: state.selectedAddressId,
      start_date: state.startDate.toISOString(),
      opt_out_dates: state.optOutDates.map((date) => date.toISOString()),
    };

    mutatePreviewPricing(previewData);
  }, [plan?._id, state.selectedAddressId, state.startDate, state.optOutDates, mutatePreviewPricing]);

  // Handlers
  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = addDays(today, CHECKOUT_CONFIG.minDaysFromToday);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < minDate) {
      toast.error("Invalid Date", {
        description: `Subscription date should be at least ${CHECKOUT_CONFIG.minDaysFromToday} day(s) from today.`,
      });
      return;
    }

    setState((prev) => ({ ...prev, startDate: date }));
  }, []);

  const handlePaymentSuccess = useCallback(
    (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
      paymentStore.setPaymentSuccess(response);
      router.push(`/checkout/success?planName=${encodeURIComponent(plan?.name || "Subscription")}`);
    },
    [paymentStore, router, plan?.name]
  );

  const handlePaymentFailure = useCallback(
    (error: { code: string; description: string }) => {
      toast.error("Payment Failed", { description: error.description });
      router.push("/checkout/error");
    },
    [router]
  );

  const handlePaymentDismissed = useCallback(() => {
    paymentStore.setPaymentCancelled();
  }, [paymentStore]);

  const setSelectedPayment = useCallback((payment: PaymentMethod) => {
    setState((prev) => ({ ...prev, selectedPayment: payment }));
  }, []);

  const setApplyWallet = useCallback((apply: boolean) => {
    setState((prev) => ({ ...prev, applyWallet: apply }));
  }, []);

  const setSelectedAddressId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedAddressId: id }));
  }, []);

  const setOptOutDates = useCallback((dates: Date[]) => {
    setState((prev) => ({ ...prev, optOutDates: dates }));
  }, []);

  const toggleAddressDialog = useCallback((show?: boolean) => {
    setState((prev) => ({ ...prev, showAddressDialog: show ?? !prev.showAddressDialog }));
  }, []);

  const toggleWalletInfo = useCallback((show?: boolean) => {
    setState((prev) => ({ ...prev, showWalletInfo: show ?? !prev.showWalletInfo }));
  }, []);

  const toggleOptOutDialog = useCallback((show?: boolean) => {
    setState((prev) => ({ ...prev, showOptOutDialog: show ?? !prev.showOptOutDialog }));
  }, []);

  return {
    // Auth state
    hasHydrated,
    isAuthenticated,
    hasPlanIntent,
    
    // Plan data
    plan,
    planId,
    
    // Address data
    addresses,
    addressesLoading,
    
    // Wallet data
    walletBalance,
    walletLoading,
    walletError,
    refetchWallet,
    
    // Payment state
    paymentStatus,
    createOrderMutation,
    
    // Local state
    state,
    pricing,
    
    // Derived values
    subscriptionDays,
    maxOptOutDays,
    perDayPrice,
    optOutDiscount,
    
    // Handlers
    handleStartDateChange,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentDismissed,
    setSelectedPayment,
    setApplyWallet,
    setSelectedAddressId,
    setOptOutDates,
    toggleAddressDialog,
    toggleWalletInfo,
    toggleOptOutDialog,
  };
}
