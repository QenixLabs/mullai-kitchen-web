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
  Target,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { usePaymentStore } from "@/hooks/use-payment-store";
import { useOrderStatus } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConfirmationStatus = "loading" | "confirmed" | "failed";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const paymentStore = usePaymentStore();
  const { orderId, razorpayPaymentId, amount, errorMessage } =
    paymentStore;

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
    <div className="relative min-h-[90vh] flex items-center justify-center p-4">
      {/* Dynamic Background Elements - Leveraging System Design Tokens */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-primary/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-success/10 blur-[130px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -15 }}
          className="w-full relative"
        >
          {/* Main Card - Using --radius-2xl (Hero Scale) */}
          <div className="bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl overflow-hidden ring-1 ring-border/50">
            {/* Celebration Sparkles (Visible on Confirmed) */}
            {status === "confirmed" && (
              <div className="absolute inset-x-0 -top-4 flex justify-center pointer-events-none z-20">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge className="h-9 px-4 gap-2 text-sm font-bold bg-success text-success-foreground border-4 border-card shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    Order Success!
                  </Badge>
                </motion.div>
              </div>
            )}

            {/* Header / Status Icon */}
            <div
              className={cn(
                "relative px-8 pt-16 pb-8 text-center flex flex-col items-center gap-6",
                status === "confirmed"
                  ? "bg-linear-to-b from-success/10 to-transparent"
                  : status === "failed"
                    ? "bg-linear-to-b from-destructive/10 to-transparent"
                    : "bg-linear-to-b from-info/10 to-transparent",
              )}
            >
              {status === "loading" && (
                <div className="relative">
                  <RefreshCw
                    className="h-20 w-20 text-info animate-spin"
                    strokeWidth={1.5}
                  />
                  <div className="absolute inset-0 bg-info/20 blur-2xl rounded-full" />
                </div>
              )}

              {status === "confirmed" && (
                <motion.div
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-success/30 blur-3xl rounded-full animate-pulse transition-all duration-1000" />
                  <div className="relative bg-success p-6 rounded-2xl shadow-xl ring-8 ring-success/5 text-success-foreground">
                    <CheckCircle2 className="h-16 w-16" strokeWidth={2.5} />
                  </div>
                </motion.div>
              )}

              {status === "failed" && (
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/15 blur-3xl rounded-full" />
                  <div className="relative bg-destructive p-6 rounded-2xl shadow-xl text-destructive-foreground">
                    <XCircle className="h-16 w-16" strokeWidth={2} />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                  {status === "loading"
                    ? "Almost There..."
                    : status === "confirmed"
                      ? "Order Confirmed!"
                      : "Verification Failed"}
                </h1>
                <p className="text-muted-foreground text-lg font-medium max-w-[85%] mx-auto leading-relaxed">
                  {status === "loading"
                    ? "We're just wrapping up some final details with your secure payment."
                    : status === "confirmed"
                      ? `Your ${planName} is now active and ready for your next healthy meal.`
                      : derivedError ||
                        "Something went wrong with your transaction verification. Please contact support."}
                </p>
              </div>
            </div>

            {/* Main Body */}
            <div className="px-8 pb-12 space-y-8 text-foreground">
              {status === "confirmed" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-muted/40 rounded-xl p-8 border border-border/50 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                      <Target className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="space-y-6 relative">
                      <div className="flex items-center gap-3 text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-[0.25em]">
                        <Receipt className="w-4 h-4" />
                        <span>Receipt Overview</span>
                      </div>

                      <div className="grid gap-5 divide-y divide-border/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0">
                          <span className="text-muted-foreground text-sm font-medium">
                            Transaction Reference
                          </span>
                          <span className="font-mono text-[0.85rem] font-bold text-foreground bg-background border border-border px-3 py-1.5 rounded-md shadow-xs">
                            {razorpayPaymentId ||
                              searchParams.get("razorpay_payment_id") ||
                              "ID Unavailable"}
                          </span>
                        </div>

                        {orderId && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-5">
                            <span className="text-muted-foreground text-sm font-medium">
                              Internal Order Reference
                            </span>
                            <span className="font-mono text-[0.85rem] font-bold text-foreground bg-background border border-border px-3 py-1.5 rounded-md shadow-xs">
                              {orderId}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-6">
                          <span className="text-foreground font-extrabold text-lg">
                            Total Charged
                          </span>
                          <div className="text-right">
                            <span className="text-3xl font-black text-foreground">
                              ₹
                              {(amount ? amount / 100 : 0).toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 },
                              )}
                            </span>
                            <p className="text-[10px] text-success font-black uppercase tracking-widest mt-1">
                              Payment Completed
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Redirection indicator - Using Primary Token */}
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                        <span className="text-sm text-primary uppercase tracking-tight">
                          Dashboard redirect pending...
                        </span>
                      </div>
                      <span className="text-sm text-primary/60">
                        {countdown}s
                      </span>
                    </div>
                    <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="h-full bg-primary rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                      />
                    </div>
                  </div>

                  {/* Actions - Using shadcn Component Patterns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      asChild
                      size="lg"
                      className="h-16 text-base font-bold rounded-xl shadow-lg shadow-primary/20 group"
                    >
                      <Link
                        href="/subscription"
                        className="flex items-center justify-center gap-3"
                      >
                        Manage Subscription
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="h-16 text-base font-bold rounded-xl shadow-xs"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-3"
                      >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  </div>
                </>
              )}

              {(status === "loading" || (status as string) === "loading") && (
                <div className="space-y-8 py-12">
                  <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-full w-1/4 bg-linear-to-r from-transparent via-info to-transparent"
                    />
                  </div>
                  <p className="text-center text-muted-foreground font-black text-sm uppercase tracking-widest animate-pulse">
                    Verifying Transaction Pipeline...
                  </p>
                </div>
              )}

              {status === "failed" && (status as string) !== "loading" && (
                <div className="space-y-8">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 flex items-start gap-5">
                    <div className="bg-destructive/15 p-3 rounded-xl text-destructive">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-destructive font-black text-sm uppercase tracking-widest">
                        Status Inconclusive
                      </h4>
                      <p className="text-destructive/80 text-sm leading-relaxed font-medium">
                        If funds were debited from your account, please do not
                        worry. Verification can sometimes take up to 2 minutes.
                        Refresh this page or exit to your dashboard.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleRetry}
                      className="h-16 bg-destructive hover:bg-destructive/90 text-white font-bold text-lg rounded-xl transition-all shadow-xl shadow-destructive/10 active:scale-[0.98]"
                      disabled={
                        retryCount >= 3 || (status as string) === "loading"
                      }
                    >
                      <RefreshCw
                        className={cn(
                          "mr-3 h-6 w-6",
                          (status as string) === "loading" && "animate-spin",
                        )}
                      />
                      {(status as string) === "loading"
                        ? "Verifying Status..."
                        : "Verify Again"}
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="h-14 font-bold text-muted-foreground hover:text-foreground"
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 justify-center"
                      >
                        <Home className="h-5 w-5" />
                        Return to Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Assistance - Token Aligned */}
          <div className="mt-8 text-center space-y-5">
            <p className="text-muted-foreground text-sm font-semibold">
              Payment secured by Razorpay. Need assistance?{" "}
              <Link
                href="/support"
                className="text-primary font-extrabold hover:underline underline-offset-8 decoration-2 ring-primary/20"
              >
                Contact Support
              </Link>
            </p>
            <div className="flex items-center justify-center gap-6 text-muted-foreground/30">
              <CreditCard className="w-6 h-6" />
              <Receipt className="w-6 h-6" />
              <ExternalLink className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="relative">
            <div className="h-24 w-24 border-8 border-muted border-t-primary rounded-full animate-spin shadow-2xl shadow-primary/20" />
            <div className="mt-8 text-center">
              <p className="text-foreground font-black text-xl animate-pulse tracking-tight">
                Preparing Experience...
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
