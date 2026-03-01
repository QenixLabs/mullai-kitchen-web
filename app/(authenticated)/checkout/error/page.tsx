"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Home,
  RefreshCw,
  ShieldAlert,
  Timer,
} from "lucide-react";

import { usePaymentStore } from "@/hooks/use-payment-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ErrorType =
  | "payment_failed"
  | "payment_cancelled"
  | "session_expired"
  | "insufficient_balance"
  | "network_error"
  | "unknown";

interface ErrorConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  showRetry: boolean;
  showContactSupport: boolean;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  payment_failed: {
    title: "Payment Failed",
    description:
      "Your payment couldn't be processed. This could be due to insufficient funds, an expired card, or a temporary issue with your bank. Please try again or use a different payment method.",
    icon: <AlertCircle className="h-8 w-8" />,
    actionText: "Try Again",
    showRetry: true,
    showContactSupport: true,
  },
  payment_cancelled: {
    title: "Payment Cancelled",
    description:
      "You cancelled the payment process. Your subscription hasn't been created and no charges were made. You can restart the checkout whenever you're ready.",
    icon: <Timer className="h-8 w-8" />,
    actionText: "Restart Checkout",
    showRetry: true,
    showContactSupport: false,
  },
  session_expired: {
    title: "Session Expired",
    description:
      "Your checkout session has expired. For security reasons, payment sessions are only valid for 15 minutes. Please start a new checkout to continue.",
    icon: <Timer className="h-8 w-8" />,
    actionText: "Start New Checkout",
    showRetry: true,
    showContactSupport: true,
  },
  insufficient_balance: {
    title: "Insufficient Wallet Balance",
    description:
      "Your Mullai Wallet balance is insufficient for this subscription. Please add funds to your wallet or use another payment method to complete the purchase.",
    icon: <CreditCard className="h-8 w-8" />,
    actionText: "Add Funds to Wallet",
    showRetry: true,
    showContactSupport: false,
  },
  network_error: {
    title: "Network Error",
    description:
      "We couldn't connect to our servers. Please check your internet connection and try again. If the problem persists, our servers might be temporarily unavailable.",
    icon: <ShieldAlert className="h-8 w-8" />,
    actionText: "Retry",
    showRetry: true,
    showContactSupport: true,
  },
  unknown: {
    title: "Something Went Wrong",
    description:
      "An unexpected error occurred during checkout. Don't worry, no charges were made. Please try again, and if the problem continues, contact our support team.",
    icon: <AlertCircle className="h-8 w-8" />,
    actionText: "Try Again",
    showRetry: true,
    showContactSupport: true,
  },
};

export default function CheckoutErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStore = usePaymentStore();

  const errorTypeParam = searchParams.get("error") as ErrorType | null;
  const planId = searchParams.get("planId");
  const addressId = searchParams.get("addressId");
  const startDate = searchParams.get("startDate");
  const paymentId = paymentStore.razorpayPaymentId;
  const orderId = paymentStore.orderId;
  const errorMessage = paymentStore.errorMessage || searchParams.get("message");

  const errorType: ErrorType =
    errorTypeParam && ERROR_CONFIGS[errorTypeParam]
      ? errorTypeParam
      : "unknown";

  const config = ERROR_CONFIGS[errorType];

  const handleRetry = () => {
    paymentStore.resetPayment();

    if (errorType === "insufficient_balance") {
      router.push("/wallet");
    } else if (errorType === "session_expired") {
      router.push("/plans");
    } else if (planId) {
      // Go back to checkout with preserved parameters
      const params = new URLSearchParams();
      params.set("planId", planId);
      if (addressId) params.set("addressId", addressId);
      if (startDate) params.set("startDate", startDate);
      router.push(`/checkout?${params.toString()}`);
    } else {
      router.push("/plans");
    }
  };

  const handleGoHome = () => {
    paymentStore.resetPayment();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 to-stone-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Error Card */}
          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-center border-b border-red-100 bg-red-50 p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600"
              >
                {config.icon}
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Title & Description */}
                <div className="space-y-3 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {config.title}
                  </h1>
                  <p className="text-gray-600">{config.description}</p>
                </div>

                {/* Error details if available */}
                {errorMessage && (
                  <Alert className="border-red-200 bg-red-50 text-red-900">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Details</AlertTitle>
                    <AlertDescription className="mt-1">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Payment info if available */}
                {(paymentId || orderId) && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="space-y-2 text-sm">
                      {paymentId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment ID</span>
                          <span className="font-mono text-xs text-gray-900">
                            {paymentId}
                          </span>
                        </div>
                      )}
                      {orderId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order ID</span>
                          <span className="font-mono text-xs text-gray-900">
                            {orderId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Helpful tips based on error type */}
                {errorType === "payment_failed" && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      Tips to resolve this:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>Check if your card has sufficient funds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>
                          Verify your card details and billing address
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>Try using a different payment method</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>
                          Contact your bank if you suspect a transaction block
                        </span>
                      </li>
                    </ul>
                  </div>
                )}

                {errorType === "insufficient_balance" && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      Did you know?
                    </h3>
                    <p className="text-sm text-gray-700">
                      You can pay partially with your wallet balance and the
                      remaining amount via card or UPI. This flexible payment
                      option allows you to use whatever balance you have
                      available.
                    </p>
                  </div>
                )}

                {errorType === "network_error" && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      What to do:
                    </h3>
                    <ul className="space-y-1.5 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>
                          Check your internet connection and try again
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>
                          If using mobile data, try switching to Wi-Fi
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span>Refresh the page and attempt checkout again</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  {config.showRetry && (
                    <Button
                      onClick={handleRetry}
                      className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {config.actionText}
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>

                {/* Contact support if needed */}
                {config.showContactSupport && (
                  <div className="pt-2 text-center">
                    <p className="text-sm text-gray-600">
                      Still having trouble?{" "}
                      <Link
                        href="/support"
                        className="font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700"
                      >
                        Contact our support team
                      </Link>
                    </p>
                  </div>
                )}

                {/* Back to plans */}
                <div className="pt-2 text-center">
                  <Button
                    asChild
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                    size="sm"
                  >
                    <Link href="/plans">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Plans
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
