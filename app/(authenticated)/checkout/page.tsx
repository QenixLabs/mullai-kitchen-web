"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  PlusCircle,
  QrCode,
  Shield,
  Wallet,
  WalletCards,
  X,
  XCircle,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";

import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/use-user-store";
import { usePaymentStore } from "@/hooks/use-payment-store";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import { useAddressList } from "@/api/hooks/useAddress";
import { useCreateOrder, useWalletBalance } from "@/api/hooks/usePayment";
import { useCreateAddress } from "@/api/hooks/useCreateAddress";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import type { Address } from "@/api/types/customer.types";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressFormStep } from "@/components/customer/onboarding/AddressFormStep";
import { addDays } from "date-fns";

// ─── Types ──────────────────────────────────────────────────────────────────

type PaymentMethod = "wallet" | "card" | "upi";

const PAYMENT_METHODS = {
  WALLET: "wallet",
  CARD: "card",
  UPI: "upi",
} as const satisfies Record<string, PaymentMethod>;

const DELIVERY_FEE = 12.5;
const ESTIMATED_TAXES_RATE = 0.05;

const CHECKOUT_CONFIG = {
  companyName: "MullaiKitchen",
  email: "support@mullaikitchen.com",
  supportEmailSubject: "Checkout Support",
  minDaysFromToday: 1,
} as const;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
}

function StepIndicator({ step, label, active }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
          active
            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
            : "border-2 border-gray-300 bg-white text-gray-400",
        )}
      >
        {step}
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          active ? "text-orange-500" : "text-gray-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onClick: () => void;
}

function AddressCard({ address, selected, onClick }: AddressCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-orange-400 bg-orange-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          {address.type}
          {address.is_default && selected && (
            <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
          )}
        </span>
        <Pencil className="h-3.5 w-3.5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600">{address.full_address}</p>
      <p className="text-xs text-gray-600">
        {address.area}, {address.city}
      </p>
      <p className="text-xs text-gray-500">
        {address.state} - {address.pincode}
      </p>
    </button>
  );
}

interface AddNewAddressCardProps {
  onClick: () => void;
}

function AddNewAddressCard({ onClick }: AddNewAddressCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center transition-all hover:border-orange-300 hover:bg-orange-50/40"
    >
      <PlusCircle className="h-6 w-6 text-gray-400" />
      <span className="text-sm font-medium text-gray-500">Add New Address</span>
    </button>
  );
}

interface PaymentOptionProps {
  id: PaymentMethod;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function PaymentOption({
  id,
  label,
  subtitle,
  icon,
  badge,
  selected,
  disabled = false,
  onClick,
}: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
        disabled
          ? "cursor-not-allowed opacity-50"
          : selected
            ? "border-orange-400 bg-orange-50/60"
            : "border-gray-200 bg-white hover:border-orange-200",
      )}
    >
      {/* Radio circle */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-orange-500 bg-orange-500" : "border-gray-300",
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <div className="flex shrink-0 items-center justify-center">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {badge}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  const planId = usePlanIntentStore((s) => s.planId);
  const plan = usePlanIntentStore((s) => s.plan);

  const hasPlanIntent = Boolean(planId && plan);

  // Payment state from store
  const paymentStore = usePaymentStore();
  const { status: paymentStatus, errorMessage: paymentError } = paymentStore;

  // React Query hooks for addresses and wallet balance
  const { data: addresses, isLoading: addressesLoading } = useAddressList();

  const {
    data: walletData,
    isLoading: walletLoading,
    error: walletError,
    refetch: refetchWallet,
  } = useWalletBalance();

  const walletBalance = walletData?.balance ?? null;

  // Mutation for creating payment orders
  const createOrderMutation = useCreateOrder();
  const createAddressMutation = useCreateAddress();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    PAYMENT_METHODS.WALLET,
  );
  const [applyWallet, setApplyWallet] = useState(true);

  // Start date (default to minimum days from today)
  const [startDate, setStartDate] = useState<Date>(() => {
    return addDays(new Date(), CHECKOUT_CONFIG.minDaysFromToday);
  });

  // Handle date change with type safety
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
    }
  };

  // Set default address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Reset payment state on mount so a stale "processing" status from a
  // previous attempt never locks the button after a page reload.
  useEffect(() => {
    paymentStore.resetPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().catch((err) => {
      console.error("Failed to load Razorpay script:", err);
      paymentStore.setErrorMessage("Failed to load payment system");
    });
  }, []);

  // Auth + intent guards
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace("/auth/signin?redirect=/checkout");
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    if (!hasPlanIntent) router.replace("/plans");
  }, [hasHydrated, hasPlanIntent, isAuthenticated, router]);

  // Handle payment success
  const handlePaymentSuccess = (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    paymentStore.setPaymentSuccess(response);
    // Redirect to success page
    router.push(
      `/checkout/success?planName=${encodeURIComponent(plan?.name || "Subscription")}`,
    );
  };

  // Handle payment failure
  const handlePaymentFailure = (error: {
    code: string;
    description: string;
    source: string;
    metadata: unknown;
  }) => {
    paymentStore.setPaymentFailed(error.description);
    router.push("/checkout/error");
  };

  // Handle payment dismissed
  const handlePaymentDismissed = () => {
    paymentStore.setPaymentCancelled();
  };

  // Handle Pay & Subscribe click
  const handlePay = async () => {
    if (!planId || !selectedAddressId || !startDate) {
      paymentStore.setErrorMessage("Please complete all checkout fields");
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

    try {
      // Create payment order using React Query mutation
      const result = await createOrderMutation.mutateAsync({
        plan_id: planId,
        address_id: selectedAddressId,
        start_date: startDate.toISOString().split("T")[0],
        apply_wallet: applyWallet,
      });

      // Store order details
      paymentStore.setPaymentProcessing(result);

      // Open Razorpay checkout
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
      // Error is handled by mutation's onError callback
      // Set error message for display
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.";
      paymentStore.setPaymentFailed(errorMessage);
    }
  };

  // Loading / redirect states
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-gray-500">
          Preparing your checkout session…
        </p>
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

  // Pricing
  const subtotal = plan.price;
  const taxes = parseFloat((subtotal * ESTIMATED_TAXES_RATE).toFixed(2));
  const total = subtotal + DELIVERY_FEE + taxes;

  // Calculate amount after wallet
  const amountAfterWallet =
    applyWallet && walletBalance !== null
      ? Math.max(0, total - walletBalance)
      : total;
  const walletReservation =
    applyWallet && walletBalance !== null ? Math.min(walletBalance, total) : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Progress Steps ──────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-0">
          <StepIndicator step={1} label="Delivery Details" active />

          {/* connector line */}
          <div className="mx-3 h-0.5 w-24 bg-gradient-to-r from-orange-400 to-gray-200 sm:w-40" />

          <StepIndicator
            step={2}
            label="Payment & Review"
            active={
              paymentStatus === "processing" || createOrderMutation.isPending
            }
          />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ─── Left column ───────────────────────────────── */}
          <div className="flex-1 space-y-5">
            {/* 1. Select Delivery Address */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
                1. Select Delivery Address
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {addressesLoading ? (
                  <div className="col-span-2 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <span className="text-sm text-gray-500">
                      Loading addresses...
                    </span>
                  </div>
                ) : addresses && addresses.length === 0 ? (
                  <div className="col-span-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                    <p className="text-sm text-gray-500">
                      No saved addresses. Please add one to continue.
                    </p>
                  </div>
                ) : (
                  addresses?.map((addr) => (
                    <AddressCard
                      key={addr._id}
                      address={addr}
                      selected={selectedAddressId === addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                    />
                  ))
                )}
                <AddNewAddressCard onClick={() => setShowAddressDialog(true)} />
              </div>

              {/* Start Date Selector */}
              <div className="mt-4 border-t border-gray-100 pt-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Subscription Start Date
                </label>
                <DatePicker
                  date={startDate}
                  onDateChange={handleStartDateChange}
                  placeholder="Select start date"
                  minDate={addDays(
                    new Date(),
                    CHECKOUT_CONFIG.minDaysFromToday,
                  )}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Subscriptions start at least{" "}
                  {CHECKOUT_CONFIG.minDaysFromToday} day(s) from today
                </p>
              </div>
            </section>

            {/* Two-Phase Wallet info banner */}
            <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Two-Phase Wallet Reservation
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                  Funds are first reserved in your Mullai Wallet to secure your
                  subscription. Deductions from your actual balance occur only
                  upon delivery confirmation.{" "}
                  <button
                    type="button"
                    onClick={() => setShowWalletInfo(true)}
                    className="font-medium text-orange-500 hover:underline"
                  >
                    Learn more about how it works.
                  </button>
                </p>
              </div>
            </div>

            {/* 2. Payment Selection */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg">
                <CreditCard className="h-5 w-5 text-orange-500" />
                2. Payment Selection
              </h2>

              {/* Wallet Balance Display */}
              {walletLoading ? (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  <span className="text-sm text-gray-600">
                    Loading wallet balance...
                  </span>
                </div>
              ) : walletError ? (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-900">
                    Failed to load wallet balance
                  </span>
                  <button
                    type="button"
                    onClick={() => refetchWallet()}
                    className="ml-auto text-sm font-semibold text-red-700 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <Wallet className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Wallet Balance
                      </p>
                      <p className="text-xs text-gray-600">Available funds</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-gray-900">
                      ₹{walletBalance?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              )}

              {/* Apply Wallet Toggle */}
              {walletBalance !== null && walletBalance > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="apply-wallet"
                      checked={applyWallet}
                      onChange={(e) => setApplyWallet(e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <div>
                      <label
                        htmlFor="apply-wallet"
                        className="text-sm font-semibold text-gray-900"
                      >
                        Apply Wallet Balance
                      </label>
                      <p className="text-xs text-gray-500">
                        Reserve ₹{walletReservation.toFixed(2)} from wallet
                      </p>
                    </div>
                  </div>
                  {applyWallet && (
                    <button
                      type="button"
                      onClick={() => setApplyWallet(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {/* Mullai Wallet */}
                <PaymentOption
                  id={PAYMENT_METHODS.WALLET}
                  label="Mullai Wallet + Card/UPI"
                  subtitle={
                    applyWallet && walletBalance !== null
                      ? `₹${walletReservation.toFixed(2)} reserved, ₹${amountAfterWallet.toFixed(2)} remaining`
                      : undefined
                  }
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                      <WalletCards className="h-4 w-4 text-orange-600" />
                    </div>
                  }
                  selected={selectedPayment === PAYMENT_METHODS.WALLET}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.WALLET)}
                />

                {/* Credit / Debit Card */}
                <PaymentOption
                  id={PAYMENT_METHODS.CARD}
                  label="Credit / Debit Card"
                  disabled={
                    applyWallet &&
                    walletBalance !== null &&
                    walletBalance >= total
                  }
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                  }
                  selected={selectedPayment === PAYMENT_METHODS.CARD}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.CARD)}
                />

                {/* UPI */}
                <PaymentOption
                  id={PAYMENT_METHODS.UPI}
                  label="UPI (PhonePe, GPay, etc.)"
                  disabled={
                    applyWallet &&
                    walletBalance !== null &&
                    walletBalance >= total
                  }
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <QrCode className="h-4 w-4 text-gray-500" />
                    </div>
                  }
                  selected={selectedPayment === PAYMENT_METHODS.UPI}
                  onClick={() => setSelectedPayment(PAYMENT_METHODS.UPI)}
                />
              </div>
            </section>

            {/* Error Message */}
            {paymentError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900">
                      Payment Error
                    </p>
                    <p className="text-sm text-red-800">{paymentError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => paymentStore.resetPayment()}
                    className="shrink-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── Right sidebar ─────────────────────────────── */}
          <div className="w-full space-y-4 lg:w-72 xl:w-80">
            {/* Order Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-base font-bold text-gray-900">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                {/* Plan row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      Monthly Subscription Plan
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.name} ({plan.duration})
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-gray-900">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Delivery Fee */}
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    Delivery Fee
                    <Info className="h-3 w-3 text-gray-400" />
                  </span>
                  <span className="font-medium text-gray-800">
                    ₹{DELIVERY_FEE.toFixed(2)}
                  </span>
                </div>

                {/* Taxes */}
                <div className="flex items-center justify-between text-gray-600">
                  <span>Estimated Taxes</span>
                  <span className="font-medium text-gray-800">
                    ₹{taxes.toFixed(2)}
                  </span>
                </div>

                {/* Wallet Applied */}
                {applyWallet && walletReservation > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      Wallet Applied
                    </span>
                    <span className="font-medium">
                      -₹{walletReservation.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="h-px bg-gray-100" />

                {/* Total */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {applyWallet && walletReservation > 0
                      ? "You're Paying"
                      : "Total to Reserve"}
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
                  onClick={handlePay}
                  disabled={
                    paymentStatus === "processing" ||
                    createOrderMutation.isPending
                  }
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {paymentStatus === "processing" ||
                  createOrderMutation.isPending ? (
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
                <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-gray-400">
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

            {/* Help chat */}
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Need help with payment?
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Our concierge is available 24/7
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${CHECKOUT_CONFIG.email}?subject=${encodeURIComponent(CHECKOUT_CONFIG.supportEmailSubject)}`}
                className="text-xs font-semibold text-orange-500 underline underline-offset-2 hover:text-orange-600"
              >
                Chat
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delivery zones info footer ─────────────────────── */}
      <div className="mt-4 flex items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-6 py-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-orange-600" />
          <p className="text-sm font-semibold text-gray-900">
            We deliver to selected serviceable pincodes. Enter your address
            during checkout to check availability.
          </p>
        </div>
      </div>

      {/* ── Address Dialog ────────────────────────────────── */}
      {showAddressDialog && (
        <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <AddressFormStep
              hideList
              hideHeader
              onAddAddress={async (address) => {
                await createAddressMutation.mutateAsync(address);
                setShowAddressDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ── Wallet Info Dialog ─────────────────────────────── */}
      {showWalletInfo && (
        <Dialog open={showWalletInfo} onOpenChange={setShowWalletInfo}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>How Two-Phase Wallet Works</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900">
                  Phase 1: Reservation
                </p>
                <p>
                  When you subscribe, funds are first reserved from your wallet
                  to guarantee your subscription slot.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Phase 2: Deduction
                </p>
                <p>
                  Actual deductions happen only when meals are delivered and
                  confirmed. Any reserved but unused funds remain in your
                  wallet.
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <p className="text-xs text-orange-800">
                  <strong>Benefit:</strong> Your balance stays secure even
                  before delivery starts.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
