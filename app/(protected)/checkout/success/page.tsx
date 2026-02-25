"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Receipt,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

import { usePaymentStore } from "@/hooks/use-payment-store";
import { useOrderStatus } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ConfirmationStatus = "loading" | "confirmed" | "failed";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const paymentStore = usePaymentStore();
  const {
    orderId,
    razorpayPaymentId,
    amount,
    currency,
    errorMessage,
  } = paymentStore;

  // Query order status from server
  const { data: orderStatus, isLoading: isCheckingStatus } = useOrderStatus(orderId || "");

  const planName = searchParams.get("planName") || "Subscription Plan";
  const subscriptionId = searchParams.get("subscriptionId");

  useEffect(() => {
    // If we have the payment data from store, we can confirm
    if (razorpayPaymentId && orderId) {
      // Use React Query data for order status
      if (orderStatus) {
        if (orderStatus.status === "paid") {
          setStatus("confirmed");

          // Auto-redirect after 5 seconds
          const redirectTimer = setTimeout(() => {
            router.push("/dashboard");
          }, 5000);

          return () => clearTimeout(redirectTimer);
        } else {
          setStatus("failed");
          setError(`Payment status: ${orderStatus.status}`);
        }
      }
    } else if (errorMessage) {
      setStatus("failed");
      setError(errorMessage);
    } else {
      // Check URL params for payment success
      const razorpayOrderId = searchParams.get("razorpay_order_id");
      const razorpayPaymentIdParam = searchParams.get("razorpay_payment_id");

      if (razorpayOrderId && razorpayPaymentIdParam) {
        setStatus("confirmed");
      } else {
        setStatus("failed");
        setError("Payment information not found");
      }
    }
  }, [razorpayPaymentId, orderId, orderStatus, errorMessage, searchParams, router]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setStatus("loading");
    setError(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-stone-100">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {/* Status Card */}
          <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl">
            {/* Header with status icon */}
            <div
              className={cn(
                "flex items-center justify-center border-b p-8 transition-colors",
                status === "loading"
                  ? "border-blue-100 bg-blue-50"
                  : status === "confirmed"
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-red-100 bg-red-50",
              )}
            >
              {status === "loading" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100"
                >
                  <RefreshCw className="h-10 w-10 text-blue-600" />
                </motion.div>
              ) : status === "confirmed" ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100"
                >
                  <XCircle className="h-10 w-10 text-red-600" />
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              {status === "loading" && (
                <div className="space-y-4 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Confirming Your Payment...
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your payment details with Razorpay.
                  </p>
                </div>
              )}

              {status === "confirmed" && (
                <div className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Payment Successful!
                    </h1>
                    <p className="text-gray-600">
                      Your subscription has been activated and your first meal will
                      be delivered on your chosen start date.
                    </p>
                  </div>

                  {/* Order Details */}
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                    <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700">
                      <Receipt className="h-4 w-4" />
                      Order Details
                    </h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan</span>
                        <span className="font-semibold text-gray-900">
                          {planName}
                        </span>
                      </div>

                      {razorpayPaymentId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Payment ID
                          </span>
                          <span className="font-mono text-xs text-gray-900">
                            {razorpayPaymentId}
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

                      {amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount</span>
                          <span className="font-bold text-gray-900">
                            {currency === "INR" ? "₹" : "$"}
                            {(amount / 100).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-semibold text-gray-900">
                          {new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-redirect notice */}
                  <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <p className="text-sm text-gray-700">
                      Redirecting to your dashboard in{" "}
                      <span className="font-semibold text-blue-700">5 seconds</span>...
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Button
                      asChild
                      className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                    >
                      <Link href="/dashboard">
                        <Home className="mr-2 h-4 w-4" />
                        Go to Dashboard
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Link href="/subscriptions">
                        <Receipt className="mr-2 h-4 w-4" />
                        View Subscriptions
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {status === "failed" && (
                <div className="space-y-6">
                  <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Payment Confirmation Failed
                    </h1>
                    <p className="text-gray-600">
                      {error ||
                        "We couldn't confirm your payment. Don't worry, if your payment was processed, it will be reflected in your wallet shortly."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Button
                      onClick={handleRetry}
                      className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                      disabled={retryCount >= 3}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {retryCount > 0 ? "Retry" : "Check Status"}
                    </Button>

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

                  {retryCount >= 3 && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <p className="text-sm text-gray-700">
                        If you're still having issues, please contact our{" "}
                        <Link
                          href="/support"
                          className="font-semibold text-orange-600 underline underline-offset-2"
                        >
                          customer support
                        </Link>
                        .
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer actions for loading state */}
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex justify-center"
            >
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <Link href="/dashboard">
                  Skip and go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
