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
  ExternalLink,
  CreditCard,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useOrderStatus } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConfirmationStatus = "loading" | "confirmed" | "failed";

// Animated ring spinner for loading state
function LoadingRing({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <svg className="h-full w-full animate-spin" viewBox="0 0 24 24">
        <circle
          className="opacity-10"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          className="opacity-100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M12 2a10 10 0 0 1 10 10"
        />
      </svg>
    </div>
  );
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const paymentStore = usePaymentStore();
  const { orderId, razorpayPaymentId, amount, errorMessage } = paymentStore;

  const { data: orderStatus } = useOrderStatus(orderId || "");

  const planName = searchParams.get("planName") || "Subscription Plan";

  // Derive status and error from orderStatus synchronously
  const { derivedStatus, derivedError } = (() => {
    let computedStatus: ConfirmationStatus = "loading";
    let computedError: string | null = null;

    if (razorpayPaymentId && orderId) {
      if (orderStatus) {
        if (orderStatus.status === "paid") {
          computedStatus = "confirmed";
        } else if (orderStatus.status === "failed") {
          computedStatus = "failed";
          computedError = `Payment failed: ${orderStatus.status}`;
        }
      }
    } else if (errorMessage) {
      computedStatus = "failed";
      computedError = errorMessage;
    } else {
      const razorpayOrderId = searchParams.get("razorpay_order_id");
      const razorpayPaymentIdParam = searchParams.get("razorpay_payment_id");

      if (razorpayOrderId && razorpayPaymentIdParam) {
        computedStatus = "confirmed";
      } else if (orderId && !orderStatus) {
        computedStatus = "loading";
      } else {
        computedStatus = "failed";
        computedError = "Payment session not found. If payment was successful, please check your subscription page.";
      }
    }

    return { derivedStatus: computedStatus, derivedError: computedError };
  })();

  // Update status when derived status changes
  useEffect(() => {
    setStatus(derivedStatus);
  }, [derivedStatus]);

  // Set error message based on derived values
  useEffect(() => {
    if (derivedError) {
      setStatus("failed");
    }
  }, [derivedError]);

  // Countdown timer for confirmed status
  useEffect(() => {
    if (status === "confirmed" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "confirmed" && countdown === 0) {
      router.push("/subscription");
    }
  }, [status, countdown, router]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setStatus("loading");
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full "
        >
          {/* Card */}
          <div className="bg-card border border-border shadow-xl rounded-2xl overflow-hidden">
            
            {/* Header Section */}
            <div
              className={cn(
                "px-6 sm:px-10 pt-12 pb-8 text-center",
                status === "confirmed" && "bg-gradient-to-b from-success/5 to-transparent",
                status === "failed" && "bg-gradient-to-b from-destructive/5 to-transparent"
              )}
            >
              {/* Icon */}
              <div className="mb-6">
                {status === "loading" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-info/20 blur-2xl rounded-full" />
                      <div className="relative text-info">
                        <LoadingRing className="h-16 w-16" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === "confirmed" && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-success/30 blur-2xl rounded-full" />
                      <div className="relative bg-success text-success-foreground rounded-full p-4 shadow-lg">
                        <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === "failed" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full" />
                      <div className="relative bg-destructive text-destructive-foreground rounded-full p-4 shadow-lg">
                        <XCircle className="h-10 w-10" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
                {status === "loading" && "Verifying Payment"}
                {status === "confirmed" && "Payment Successful"}
                {status === "failed" && "Payment Failed"}
              </h1>

              {/* Subtitle */}
              <p className="text-muted-foreground text-base leading-relaxed mx-auto">
                {status === "loading" && "We're confirming your transaction with the payment gateway."}
                {status === "confirmed" && `Your ${planName} subscription is now active.`}
                {status === "failed" && (derivedError || "Something went wrong. Please try again or contact support.")}
              </p>
            </div>

            {/* Content Section */}
            <div className="px-6 sm:px-10 pb-10">
              
              {/* Loading State - Simple Progress */}
              {status === "loading" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        animate={{ 
                          width: ["0%", "70%", "50%", "80%"],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="h-full bg-info rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing</span>
                      <span className="text-info font-medium">Verifying...</span>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="flex items-center justify-center gap-6 pt-4 text-muted-foreground/60">
                    <div className="flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Encrypted</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Confirmed State */}
              {status === "confirmed" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Receipt Card */}
                  <div className="bg-muted/50 rounded-xl p-5 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-4">
                      <Receipt className="h-3.5 w-3.5" />
                      Transaction Details
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono text-foreground">
                          {razorpayPaymentId || searchParams.get("razorpay_payment_id") || "N/A"}
                        </span>
                      </div>
                      
                      {orderId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order ID</span>
                          <span className="font-mono text-foreground">{orderId}</span>
                        </div>
                      )}
                      
                      <div className="h-px bg-border my-3" />
                      
                      <div className="flex justify-between items-baseline">
                        <span className="text-foreground font-medium">Total Paid</span>
                        <span className="text-2xl font-semibold text-foreground">
                          ₹{(amount ? amount : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Redirect Notice */}
                  <div className="flex items-center justify-between bg-primary/5 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                      <span className="text-primary">Redirecting in {countdown}s</span>
                    </div>
                    <div className="w-20 h-1 bg-primary/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button asChild size="lg" className="h-12 font-medium">
                      <Link href="/subscription" className="flex items-center justify-center gap-2">
                        View Subscription
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-12 font-medium">
                      <Link href="/dashboard" className="flex items-center justify-center gap-2">
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Failed State */}
              {status === "failed" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-5">
                    <p className="text-sm text-destructive/90 leading-relaxed">
                      If funds were deducted from your account, don't worry. 
                      Verification can take up to 2 minutes. Please wait or try again.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleRetry}
                      disabled={retryCount >= 3}
                      className="w-full h-12 bg-destructive hover:bg-destructive/90 text-white font-medium"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                    <Button asChild variant="ghost" className="w-full h-12 font-medium">
                      <Link href="/dashboard" className="flex items-center justify-center gap-2">
                        <Home className="h-4 w-4" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline font-medium">
                Contact Support
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/50">
              <ShieldCheck className="h-3 w-3" />
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Suspense Fallback - Clean minimal loader
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative text-primary">
            <LoadingRing className="h-12 w-12" />
          </div>
        </div>
        <h2 className="text-lg font-medium text-foreground mb-1">Loading...</h2>
        <p className="text-sm text-muted-foreground">Please wait</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
