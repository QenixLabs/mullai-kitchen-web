"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { toast } from "sonner";

import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useUserStore";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import {
  useCheckoutPlanId,
  useCheckoutPlanData,
  useHasCheckoutPlanIntent,
} from "@/hooks/useCheckoutStore";
import { useAddressList } from "@/api/hooks/useAddress";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import {
  usePreviewPricing,
  useWalletBalance,
  useCreateOrder,
} from "@/api/hooks/usePayment";
import {
  CHECKOUT_CONFIG,
  PAYMENT_METHODS,
  type PaymentMethod,
  type PricingBreakdown,
} from "@/lib/checkout-config";
import type { PaymentStore } from "@/stores/payment-store";
import type { PaymentSuccessResponse } from "@/api/types/payment.types";
import type { AppliedCoupon } from "@/components/customer/checkout/CouponSelector";
import type { MealType } from "@/stores/plan-intent-store";
import type { AddressType } from "@/api/types/customer.types";

export interface MealAddressMapping {
  meal_type: string;
  address_id: string;
}

export interface CheckoutState {
  selectedAddressId: string | null;
  selectedPayment: PaymentMethod;
  applyWallet: boolean;
  startDate: Date;
  optOutDates: Date[];
  showAddressDialog: boolean;
  showWalletInfo: boolean;
  showOptOutDialog: boolean;
  appliedCoupon: AppliedCoupon | null;
  selectedMealType: MealType | null;
  mealAddressMappings: MealAddressMapping[];
}

export interface UseCheckoutReturn {
  // Auth state
  hasHydrated: boolean;
  isAuthenticated: boolean;
  hasPlanIntent: boolean;

  // Plan data
  plan: ReturnType<typeof useCheckoutPlanData>;
  planId: ReturnType<typeof useCheckoutPlanId>;

  // Address data
  addresses: ReturnType<typeof useAddressList>["data"];
  addressesLoading: boolean;

  // Wallet data
  walletBalance: number | null;
  walletLoading: boolean;
  walletError: Error | null;
  refetchWallet: () => void;

  // Payment state
  paymentStatus: PaymentStore["status"];
  createOrderMutation: ReturnType<typeof useCreateOrder>;
  previewPricingMutation: ReturnType<typeof usePreviewPricing>;

  // Local state
  state: CheckoutState;
  pricing: PricingBreakdown;

  // Derived values
  subscriptionDays: number;
  maxOptOutDays: number;
  perDayPrice: number;
  optOutDiscount: number;

  // Actions
  setSelectedPayment: (payment: PaymentMethod) => void;
  setApplyWallet: (apply: boolean) => void;
  setSelectedAddressId: (id: string) => void;
  setOptOutDates: (dates: Date[]) => void;
  setStartDate: (date: Date) => void;
  toggleAddressDialog: (show?: boolean) => void;
  toggleWalletInfo: (show?: boolean) => void;
  toggleOptOutDialog: (show?: boolean) => void;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  handleStartDateChange: (date: Date | undefined) => void;
  setSelectedMealType: (mealType: MealType | null) => void;
  // Meal address mapping actions
  setMealAddressMapping: (mealType: string, addressId: string) => void;
  removeMealAddressMapping: (mealType: string) => void;
  getMealAddressMapping: (mealType: string) => string | null;
  // Helper to get suggested address type based on selected meal
  getSuggestedAddressType: () => AddressType | null;
  handlePaymentSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  handlePaymentFailure: (error: { code: string; description: string }) => void;
  handlePaymentDismissed: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const planId = useCheckoutPlanId();
  const plan = useCheckoutPlanData();
  const hasPlanIntent = useHasCheckoutPlanIntent();

  const paymentStore = usePaymentStore();
  const { status: paymentStatus } = paymentStore;

  const { data: addresses, isLoading: addressesLoading } = useAddressList();

  // Read pre-selected address from plan-intent-store
  const preSelectedAddressId = usePlanIntentStore((state) => state.selectedAddressId);
  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useWalletBalance();

  const walletBalance = walletData?.balance ?? null;
  const createOrderMutation = useCreateOrder();
  const previewPricingMutation = usePreviewPricing();

  // Helper to get minimum start date (normalized to midnight)
  const getMinStartDate = () => {
    const date = addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Read from plan-intent-store
  const preSelectedMealType = usePlanIntentStore((state) => state.selectedMealType);

  // Consolidated state
  const [state, setState] = useState<CheckoutState>({
    selectedAddressId: null,
    selectedPayment: PAYMENT_METHODS.WALLET,
    applyWallet: true,
    startDate: getMinStartDate(),
    optOutDates: [],
    showAddressDialog: false,
    showWalletInfo: false,
    showOptOutDialog: false,
    appliedCoupon: null,
    selectedMealType: preSelectedMealType,
    mealAddressMappings: [],
  });

  // Derived values
  const subscriptionDays = useMemo(() => {
    // Map duration enum to days
    const durationMap: Record<string, number> = {
      Weekly: 7,
      Monthly: 30,
      Quarterly: 90,
    };

    if (plan?.duration && durationMap[plan.duration]) {
      return durationMap[plan.duration];
    }

    // Fallback: try to extract number from duration string (for backward compatibility)
    const durationMatch = plan?.duration?.match(/\d+/);
    if (durationMatch) {
      return parseInt(durationMatch[0], 10);
    }

    return 30; // Default fallback
  }, [plan?.duration]);

  const maxOptOutDays = useMemo(
    () => Math.floor(subscriptionDays * 0.5),
    [subscriptionDays],
  );

  const perDayPrice = useMemo(() => {
    if (!plan?.price || subscriptionDays <= 0) return 0;
    return plan.price / subscriptionDays;
  }, [plan?.price, subscriptionDays]);

  const optOutDiscount = useMemo(
    () => state.optOutDates.length * perDayPrice,
    [state.optOutDates.length, perDayPrice],
  );

  // Pricing calculations with useMemo
  const pricing: PricingBreakdown = useMemo(() => {
    const subtotal = plan?.price ?? 0;
    const discountedSubtotal = Math.max(0, subtotal - optOutDiscount);

    const previewData = previewPricingMutation.data;
    // Use server-provided coupon discount if available, fallback to local calculation
    const couponDiscount = previewData?.couponDiscount ?? state.appliedCoupon?.discountAmount ?? 0;
    const discountedWithCoupon = Math.max(0, discountedSubtotal - couponDiscount);

    const deliveryCharge = previewData?.deliveryCharge ?? 30;
    const taxes =
      previewData?.tax ?? parseFloat((discountedWithCoupon * 0.05).toFixed(2));
    const total =
      previewData?.total ?? discountedWithCoupon + deliveryCharge + taxes;

    const walletReservation =
      state.applyWallet && walletBalance !== null
        ? Math.min(walletBalance, total)
        : 0;
    const amountAfterWallet =
      state.applyWallet && walletBalance !== null
        ? Math.max(0, total - walletBalance)
        : total;

    return {
      subtotal,
      optOutDiscount,
      discountedSubtotal,
      couponDiscount,
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
    state.appliedCoupon,
    previewPricingMutation.data,
    state.applyWallet,
    walletBalance,
    perDayPrice,
    subscriptionDays,
    maxOptOutDays,
  ]);

  // Effects
  useEffect(() => {
    paymentStore.resetPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      startDate: addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday),
    }));
  }, []);

  // Set default address: prefer pre-selected from plan-intent-store, then default address, then first address
  useEffect(() => {
    if (addresses?.length && !state.selectedAddressId) {
      // Check if pre-selected address exists in user's addresses
      const preSelectedExists = preSelectedAddressId && addresses.some((a) => a._id === preSelectedAddressId);

      let addressToSelect = null;
      if (preSelectedExists) {
        addressToSelect = addresses.find((a) => a._id === preSelectedAddressId);
      } else {
        // Fall back to default address or first address
        addressToSelect = addresses.find((a) => a.is_default) ?? addresses[0];
      }

      if (addressToSelect) {
        setState((prev) => ({ ...prev, selectedAddressId: addressToSelect._id }));
      }
    }
  }, [addresses, state.selectedAddressId, preSelectedAddressId]);

  // Pre-load Zoho Payments script for faster checkout
  useEffect(() => {
    import("@/lib/zoho-payments").then(({ loadZohoPaymentsScript }) => {
      loadZohoPaymentsScript().catch((err) => {
        console.error("Failed to load Zoho Payments script:", err);
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
    if (!plan?._id || !state.selectedAddressId) return;

    // Ensure startDate is a valid Date
    if (!(state.startDate instanceof Date) || isNaN(state.startDate.getTime())) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = addDays(today, CHECKOUT_CONFIG.minDaysFromToday);
    minDate.setHours(0, 0, 0, 0);

    // Normalize start date to midnight for comparison
    const normalizedStartDate = new Date(state.startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);

    // Skip if start date is before minimum date
    if (normalizedStartDate < minDate) {
      console.log('[useCheckout] Skipping preview pricing - date too early:', {
        normalizedStartDate: normalizedStartDate.toISOString(),
        minDate: minDate.toISOString(),
        minDaysFromToday: CHECKOUT_CONFIG.minDaysFromToday,
      });
      return;
    }

    // Format dates as YYYY-MM-DD to avoid timezone issues
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const previewData = {
      plan_id: plan._id,
      address_id: state.selectedAddressId,
      start_date: formatDate(normalizedStartDate),
      opt_out_dates: state.optOutDates.map((date) =>
        date instanceof Date ? formatDate(date) : formatDate(new Date(date))
      ),
      coupon_id: state.appliedCoupon?.couponId,
    };

    console.log('[useCheckout] Calling preview pricing with:', previewData);

    mutatePreviewPricing(previewData);
  }, [
    plan?._id,
    state.selectedAddressId,
    state.startDate,
    state.optOutDates,
    mutatePreviewPricing,
    state.appliedCoupon?.couponId,
  ]);

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
    (response: PaymentSuccessResponse) => {
      paymentStore.setPaymentSuccess(response);
      router.push(
        `/checkout/success?planName=${encodeURIComponent(plan?.name || "Subscription")}`,
      );
    },
    [paymentStore, router, plan?.name],
  );

  const handlePaymentFailure = useCallback(
    (error: { code: string; message: string }) => {
      toast.error("Payment Failed", { description: error.message });
      router.push("/checkout/error");
    },
    [router],
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

  const setStartDate = useCallback((date: Date) => {
    setState((prev) => ({ ...prev, startDate: date }));
  }, []);

  const toggleAddressDialog = useCallback((show?: boolean) => {
    setState((prev) => ({
      ...prev,
      showAddressDialog: show ?? !prev.showAddressDialog,
    }));
  }, []);

  const toggleWalletInfo = useCallback((show?: boolean) => {
    setState((prev) => ({
      ...prev,
      showWalletInfo: show ?? !prev.showWalletInfo,
    }));
  }, []);

  const toggleOptOutDialog = useCallback((show?: boolean) => {
    setState((prev) => ({
      ...prev,
      showOptOutDialog: show ?? !prev.showOptOutDialog,
    }));
  }, []);

  const setAppliedCoupon = useCallback((coupon: AppliedCoupon | null) => {
    setState((prev) => ({ ...prev, appliedCoupon: coupon }));
  }, []);

  const setSelectedMealType = useCallback((mealType: MealType | null) => {
    setState((prev) => ({ ...prev, selectedMealType: mealType }));
  }, []);

  // Set or update a meal address mapping
  const setMealAddressMapping = useCallback((mealType: string, addressId: string) => {
    setState((prev) => {
      const existingIndex = prev.mealAddressMappings.findIndex(
        (m) => m.meal_type === mealType
      );
      if (existingIndex >= 0) {
        // Update existing mapping
        const updated = [...prev.mealAddressMappings];
        updated[existingIndex] = { meal_type: mealType, address_id: addressId };
        return { ...prev, mealAddressMappings: updated };
      }
      // Add new mapping
      return {
        ...prev,
        mealAddressMappings: [...prev.mealAddressMappings, { meal_type: mealType, address_id: addressId }],
      };
    });
  }, []);

  // Remove a meal address mapping
  const removeMealAddressMapping = useCallback((mealType: string) => {
    setState((prev) => ({
      ...prev,
      mealAddressMappings: prev.mealAddressMappings.filter((m) => m.meal_type !== mealType),
    }));
  }, []);

  // Get address ID for a specific meal type
  const getMealAddressMapping = useCallback(
    (mealType: string): string | null => {
      const mapping = state.mealAddressMappings.find((m) => m.meal_type === mealType);
      return mapping?.address_id || null;
    },
    [state.mealAddressMappings]
  );

  const getSuggestedAddressType = useCallback((): AddressType | null => {
    const mealType = state.selectedMealType;
    if (!mealType) return null;

    // Breakfast → Home, Dinner → Office, Lunch → Home (or Office as fallback)
    switch (mealType) {
      case "Breakfast":
        return "Home";
      case "Dinner":
        return "Office";
      case "Lunch":
        return "Home"; // Default to Home for lunch
      default:
        return null;
    }
  }, [state.selectedMealType]);

  return {
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
    previewPricingMutation,
    state,
    pricing,
    subscriptionDays,
    maxOptOutDays,
    perDayPrice,
    optOutDiscount,
    setSelectedPayment,
    setApplyWallet,
    setSelectedAddressId,
    setOptOutDates,
    setStartDate,
    toggleAddressDialog,
    toggleWalletInfo,
    toggleOptOutDialog,
    setAppliedCoupon,
    handleStartDateChange,
    handlePaymentSuccess,
    handlePaymentFailure,
    handlePaymentDismissed,
    setSelectedMealType,
    getSuggestedAddressType,
    setMealAddressMapping,
    removeMealAddressMapping,
    getMealAddressMapping,
  };
}
