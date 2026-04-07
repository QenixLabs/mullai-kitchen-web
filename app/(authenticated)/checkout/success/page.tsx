"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  RefreshCw,
  XCircle,
  Utensils,
  Clock,
  Calendar,
  MapPin,
  Download,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, addMonths } from "date-fns";

import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useOrderStatus } from "@/api/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ConfirmationStatus = "loading" | "confirmed" | "failed";

// Mock subscription data - in real app this would come from API
const MOCK_SUBSCRIPTION = {
  planName: "Monthly Subscription",
  planType: "Active Monthly Plan",
  mealPreference: "Vegetarian",
  deliverySlot: "Lunch & Dinner (Daily)",
  renewalDate: addMonths(new Date(), 1),
  deliveryLocation: "123 Culinary Lane, Foodie District, Chennai",
  firstDeliveryTime: "7:30 AM",
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConfirmationStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);

  const paymentStore = usePaymentStore();
  const { orderId, razorpayPaymentId, paymentId, amount, errorMessage } = paymentStore;

  const { data: orderStatus } = useOrderStatus(orderId || "");

  const [displayOrderId] = useState(() =>
    `ME-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`
  );

  // Derive status and error from orderStatus synchronously
  const { derivedStatus, derivedError } = (() => {
    let computedStatus: ConfirmationStatus = "loading";
    let computedError: string | null = null;

    // Check for successful payment (Razorpay or Zoho)
    const hasPaymentId = razorpayPaymentId || paymentId;

    if (hasPaymentId && orderId) {
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

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setStatus("loading");
    window.location.reload();
  };

  // Generate order ID for display
  const displayOrderIdValue = orderId || displayOrderId;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto"
        >
          {/* Success Header */}
          {status === "confirmed" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              {/* Success Icon */}
              <div className="relative inline-flex mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                <div className="relative w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#44151C] mb-3">
                Order Placed Successfully!
              </h1>
              <p className="text-[#797778] max-w-md mx-auto mb-6">
                Your culinary journey begins now. We&apos;ve sent a confirmation email to your registered address.
              </p>

              {/* Order ID Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#E8E1E4] shadow-sm">
                <span className="text-xs text-[#797778] uppercase tracking-wider">Order ID:</span>
                <span className="font-mono font-semibold text-[#44151C]">{displayOrderIdValue}</span>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <Loader2 className="relative w-16 h-16 text-primary animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-[#44151C] mb-2">Verifying Payment</h2>
              <p className="text-[#797778]">We&apos;re confirming your transaction...</p>
            </div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-md mx-auto text-center py-12"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#44151C] mb-3">Payment Failed</h2>
              <p className="text-[#797778] mb-6">{derivedError || "Something went wrong. Please try again."}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleRetry} disabled={retryCount >= 3} className="bg-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Main Content - Only show for confirmed */}
          {status === "confirmed" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 sm:gap-6">
              {/* Left Column - Subscription Details */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl border border-[#E8E1E4] p-5 sm:p-8">
                  {/* Plan Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7 sm:mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-[#2A1216] mb-1">
                        {MOCK_SUBSCRIPTION.planName}
                      </h2>
                      <p className="text-[#797778]">{MOCK_SUBSCRIPTION.planType}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Status: Active
                    </Badge>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-8">
                    {/* Meal Preference */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F1F3] flex items-center justify-center shrink-0">
                        <Utensils className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-1">
                          Meal Preference
                        </p>
                        <p className="text-[#2A1216] font-medium">
                          {MOCK_SUBSCRIPTION.mealPreference}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Slot */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F1F3] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-1">
                          Delivery Slot
                        </p>
                        <p className="text-[#2A1216] font-medium">
                          {MOCK_SUBSCRIPTION.deliverySlot}
                        </p>
                      </div>
                    </div>

                    {/* Renewal Date */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F1F3] flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-1">
                          Renewal Date
                        </p>
                        <p className="text-[#2A1216] font-medium">
                          {format(MOCK_SUBSCRIPTION.renewalDate, "do MMMM yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Location */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F5F1F3] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#797778] uppercase tracking-wider mb-1">
                          Delivery Location
                        </p>
                        <p className="text-[#2A1216] font-medium line-clamp-2">
                          {MOCK_SUBSCRIPTION.deliveryLocation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Food Image */}
                  <div className="relative rounded-xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
                      alt="Your meal"
                      width={600}
                      height={300}
                      className="w-full h-44 sm:h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-medium">
                        Your first delivery arrives tomorrow at {MOCK_SUBSCRIPTION.firstDeliveryTime}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Payment & Next Steps */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* Payment Details */}
                <div className="bg-[#F5F1F3] rounded-2xl p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-[#2A1216] mb-4">Payment Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#797778]">Monthly Plan</span>
                      <span className="text-[#2A1216] font-medium">
                        ₹{(amount || 2499).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#797778]">Service & Delivery</span>
                      <span className="text-[#2A1216] font-medium">0.00</span>
                    </div>
                    <div className="border-t border-[#E8E1E4] pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-[#2A1216] font-semibold">Total Paid</span>
                        <span className="text-xl font-bold text-[#44151C]">
                          ₹{(amount || 2499).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What's Next */}
                <div className="bg-white rounded-2xl border border-[#E8E1E4] p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-[#2A1216] mb-4 text-center">
                    What&apos;s Next?
                  </h3>
                  <Button
                    asChild
                    className="w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 mb-3"
                  >
                    <Link href="/subscription" className="flex items-center justify-center gap-2">
                      Go to Subscriptions
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-[#797778] hover:text-primary"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice (PDF)
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Suspense Fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-medium text-[#44151C]">Loading...</h2>
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
