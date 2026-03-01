"use client";

import { useEffect, useState, Suspense } from "react";
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

import { usePaymentStore } from "@/hooks/use-payment-store";
import { useOrderStatus } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ConfirmationStatus = "loading" | "confirmed" | "failed";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const paymentStore = usePaymentStore();
  const { orderId, razorpayPaymentId, amount, currency, errorMessage } =
    paymentStore;

  const { data: orderStatus } = useOrderStatus(orderId || "");

  const planName = searchParams.get("planName") || "Subscription Plan";

  useEffect(() => {
    if (razorpayPaymentId && orderId) {
      if (orderStatus) {
        if (orderStatus.status === "paid") {
          setStatus("confirmed");
          const redirectTimer = setTimeout(() => {
            router.push("/subscription");
          }, 5000);
          return () => clearTimeout(redirectTimer);
        } else if (orderStatus.status === "failed") {
          setStatus("failed");
          setError(`Payment failed: ${orderStatus.status}`);
        }
      }
    } else if (errorMessage) {
      setStatus("failed");
      setError(errorMessage);
    } else {
      const razorpayOrderId = searchParams.get("razorpay_order_id");
      const razorpayPaymentIdParam = searchParams.get("razorpay_payment_id");

      if (razorpayOrderId && razorpayPaymentIdParam) {
        setStatus("confirmed");
        const redirectTimer = setTimeout(() => {
          router.push("/subscription");
        }, 5000);
        return () => clearTimeout(redirectTimer);
      } else if (orderId && !orderStatus) {
        // Still loading order status
        setStatus("loading");
      } else {
        setStatus("failed");
        setError(
          "Payment session not found. If payment was successful, please check your subscription page.",
        );
      }
    }
  }, [
    razorpayPaymentId,
    orderId,
    orderStatus,
    errorMessage,
    searchParams,
    router,
  ]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setStatus("loading");
    setError(null);
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl py-12 md:py-20">
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Status Header */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-4 border-b p-8 md:p-12",
            status === "loading"
              ? "bg-blue-50/50"
              : status === "confirmed"
                ? "bg-emerald-50/50"
                : "bg-red-50/50",
          )}
        >
          {status === "loading" ? (
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
          ) : status === "confirmed" ? (
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          ) : (
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight text-center">
            {status === "loading"
              ? "Verifying Payment"
              : status === "confirmed"
                ? "Payment Success!"
                : "Payment Status"}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 space-y-8">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <p className="text-gray-600 text-lg mx-auto max-w-md">
                We're confirming your transaction with Razorpay. This shouldn't
                take long...
              </p>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {status === "confirmed" && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <p className="text-gray-600 text-lg">
                  Awesome! Your {planName} is now active.
                </p>
                <p className="text-slate-500">
                  A confirmation email has been sent to your inbox.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 pb-2">
                  Subscription Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-500">Transaction ID</span>
                    <span className="font-mono font-medium text-gray-900 break-all ml-4">
                      {razorpayPaymentId ||
                        searchParams.get("razorpay_payment_id")}
                    </span>
                  </div>
                  {orderId && (
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-500">Order ID</span>
                      <span className="font-mono font-medium text-gray-900 ml-4">
                        {orderId}
                      </span>
                    </div>
                  )}
                  {amount && (
                    <div className="flex justify-between text-sm sm:text-base pt-3 border-t border-slate-200 mt-3">
                      <span className="text-gray-900 font-bold">
                        Total Charged
                      </span>
                      <span className="font-bold text-gray-900 text-lg">
                        ₹{(amount / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50/80 rounded-2xl p-4 flex items-center justify-center gap-3 border border-blue-100">
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                <p className="text-sm font-semibold text-blue-800">
                  Redirecting to your subscription in 5s...
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95"
                >
                  <Link href="/subscription">Manage Subscription</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-14 font-bold border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <p className="text-red-800 font-bold text-lg mb-1">
                  Checking Payment Status
                </p>
                <p className="text-red-700/80 italic">
                  {error ||
                    "We're having trouble locating your recent payment record."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                <Receipt className="h-4 w-4 shrink-0" />
                <p>
                  If you received a confirmation from your bank, please wait a
                  moment for our server to sync.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={handleRetry}
                  size="lg"
                  className="h-14 bg-orange-600 hover:bg-orange-700 font-bold text-lg rounded-xl transition-all active:scale-95"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  {retryCount > 0 ? "Retry Verification" : "Update Status"}
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-14 font-bold text-slate-400 hover:text-slate-600"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-8 max-w-4xl py-24">
          <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-12 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Hang tight!</h2>
              <p className="text-slate-500 font-medium">
                Preparing your success receipt...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
