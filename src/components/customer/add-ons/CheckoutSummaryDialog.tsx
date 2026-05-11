"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { X, AlertCircle, Wallet, CreditCard } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { loadZohoPaymentsScript, openZohoCheckout } from "@/lib/zoho-payments";
import {
  usePrepareCheckoutIndependent,
  useCreateAddOnOrderIndependent,
} from "@/api/hooks/useAddons";
import { useWalletBalance } from "@/api/hooks/usePayment";
import { useCurrentUser } from "@/hooks/useUserStore";
import { toast } from "sonner";
import type { MealType } from "@/api/types/addons.types";

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Dinner: "Dinner",
};

interface CheckoutSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{
    item_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    meal_type: MealType;
    max_quantity: number;
    image?: string;
  }>;
  deliveryDate: string;
  onDeliveryDateChange?: (date: string) => void;
  maxDeliveryDate?: string;
  mealTypes: MealType[];
  onOrderSuccess: () => void;
}

export function CheckoutSummaryDialog({
  isOpen,
  onClose,
  cartItems,
  deliveryDate,
  onDeliveryDateChange,
  maxDeliveryDate,
  mealTypes,
  onOrderSuccess,
}: CheckoutSummaryDialogProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [localCartItems, setLocalCartItems] = useState(cartItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "zoho">("zoho");

  const { data: walletData } = useWalletBalance();
  const user = useCurrentUser();
  const prepareCheckout = usePrepareCheckoutIndependent();
  const createOrder = useCreateAddOnOrderIndependent();

  // Compute maxDeliveryDate: 30 days from now if not provided
  const effectiveMaxDeliveryDate = useMemo(() => {
    if (maxDeliveryDate) return maxDeliveryDate;
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, [maxDeliveryDate]);

  // Reset local cart to prop whenever dialog opens (avoid stale state from previous open)
  useEffect(() => {
    if (isOpen) {
      setLocalCartItems(cartItems);
    }
  }, [isOpen, cartItems]);

  // Auto-select first meal type when mealTypes become available
  useEffect(() => {
    if (mealTypes.length > 0 && !selectedMealType) {
      setSelectedMealType(mealTypes[0]);
    }
  }, [mealTypes, selectedMealType]);

  // Reset processing/error states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setCheckoutError(null);
    }
  }, [isOpen]);

  // Client-side total for display (no server call until confirm)
  const walletBalance = walletData?.balance || 0;
  const clientSideTotal = useMemo(
    () => localCartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [localCartItems]
  );

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (!selectedMealType) return;
    setLocalCartItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId
          ? { ...item, quantity: newQuantity, meal_type: selectedMealType }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setLocalCartItems((prev) => prev.filter((item) => item.item_id !== itemId));
  };

  const handleConfirmOrder = async () => {
    if (localCartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedMealType) {
      toast.error("Please select a meal type");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < clientSideTotal) {
      toast.error("Insufficient wallet balance. Please choose Zoho Pay or add funds.");
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    const useWallet = paymentMethod === "wallet";

    try {
      // Step 1: Prepare checkout (get payment session from server)
      const result = await prepareCheckout.mutateAsync({
        meal_type: selectedMealType,
        items: localCartItems.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          meal_type: selectedMealType,
        })),
        delivery_date: deliveryDate,
        apply_wallet: useWallet,
      });

      // Validate server total matches client total to catch pricing drift
      if (result.total_amount !== clientSideTotal) {
        toast.error("Pricing mismatch", {
          description: `Cart total changed on server. Please review your cart and try again.`,
        });
        setCheckoutError("Cart total mismatch. Please review and try again.");
        setIsProcessing(false);
        return;
      }

      // Step 2a: If wallet payment and fully covered by balance, create order directly
      if (useWallet && result.amount_to_pay === 0) {
        const orderResult = await createOrder.mutateAsync({
          meal_type: selectedMealType,
          items: localCartItems.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            meal_type: selectedMealType,
          })),
          delivery_date: deliveryDate,
          payment_id: "WALLET_PAYMENT",
          payments_session_id: result.payment_session_id,
        });

        // Interceptor unwraps { data, success, message } → inner data,
        // so orderResult is the inner data (has order_id, etc. but no success field).
        // If mutateAsync didn't throw, the order succeeded.
        toast.success("Order placed successfully!", {
          description: `Order #${orderResult.order_id?.slice(-6)} has been confirmed.`,
        });
        onOrderSuccess();
        onClose();
        return;
      }

      // Step 2b: Open Zoho payment widget — close this dialog first so
      // the Dialog overlay doesn't block clicks inside the Zoho widget.
      onClose();
      await loadZohoPaymentsScript();

      openZohoCheckout({
        accountId: result.provider_account_id ?? "",
        paymentSessionId: result.payment_session_id ?? "",
        amount: result.amount_to_pay,
        currency: result.currency || "INR",
        customer: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
        },
        description: result.subscription_id
          ? `Add-on order for ${selectedMealType.toLowerCase()}`
          : "Add-on order",
        invoiceNumber: result.subscription_id,
        onSuccess: async (paymentResponse) => {
          try {
            const orderResult = await createOrder.mutateAsync({
              meal_type: selectedMealType,
              items: localCartItems.map((item) => ({
                item_id: item.item_id,
                quantity: item.quantity,
                meal_type: selectedMealType,
              })),
              delivery_date: deliveryDate,
              payment_id: paymentResponse.payment_id,
              payments_session_id: paymentResponse.payments_session_id,
            });

            // Interceptor unwraps { data, success, message } → inner data.
            // If mutateAsync didn't throw, the order succeeded.
            toast.success("Order placed successfully!", {
              description: `Order #${orderResult.order_id?.slice(-6)} has been confirmed.`,
            });
            onOrderSuccess();
            onClose();
          } catch (orderError) {
            toast.error(
              orderError instanceof Error
                ? orderError.message
                : "Failed to confirm order after payment"
            );
          }
        },
        onFailure: (error) => {
          toast.error(error.message || "Payment failed");
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process order. Please try again.";
      toast.error("Order Failed", { description: errorMessage });
      setCheckoutError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm w-full max-h-[85vh] flex flex-col p-0 gap-0 bg-[#FAFAFA] border-none rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-2 relative shrink-0">
          <DialogTitle className="text-xl font-bold text-[#39070F]">
            Checkout Summary
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Secure your add-ons
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-6 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </DialogHeader>

        {/* Delivery Date Picker */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white w-fit">
            <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => onDeliveryDateChange?.(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              max={effectiveMaxDeliveryDate}
              className="bg-transparent border-none outline-none text-sm text-foreground"
            />
          </div>
        </div>

        {/* Section 1: Meal Type Picker */}
        {mealTypes.length > 0 && (
          <div className="px-6 py-2">
            <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
              Deliver with which meal?
            </p>
            <div className="flex gap-2" role="radiogroup" aria-label="Meal type">
              {mealTypes.map((mt) => (
                <button
                  key={mt}
                  onClick={() => setSelectedMealType(mt)}
                  role="radio"
                  aria-checked={selectedMealType === mt}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                    selectedMealType === mt
                      ? "bg-[#39070F] text-white"
                      : "bg-[#F0F0F0] text-gray-700 hover:bg-[#E8E8E8]"
                  )}
                >
                  {MEAL_TYPE_LABELS[mt]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {checkoutError && (
          <div className="px-6 pb-2">
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          </div>
        )}

        {/* Section 2: Cart Items */}
        <div className="flex-1 max-h-[30vh] overflow-y-auto px-6">
          {localCartItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {localCartItems.map((item) => (
                <div key={item.item_id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0">
                  {/* Thumbnail */}
                  <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={item.image || "/images/addon/add-on.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? handleQuantityChange(item.item_id, item.quantity - 1)
                          : handleRemoveItem(item.item_id)
                      }
                      className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-gray-700 w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.item_id, item.quantity + 1)}
                      disabled={item.quantity >= item.max_quantity}
                      className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Price */}
                  <p className="font-semibold text-gray-900 shrink-0 ml-2">
                    {formatPrice(item.unit_price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Payment Method + Order Total */}
        <div className="px-6 pt-3 pb-2 shrink-0">
          {/* Payment Method Selector */}
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
            Payment Method
          </p>
          <div className="space-y-2 mb-3">
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all text-left",
                paymentMethod === "wallet"
                  ? "border-[#39070F] bg-[#39070F]/5 ring-1 ring-[#39070F]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <Wallet className={cn("h-5 w-5 shrink-0", paymentMethod === "wallet" ? "text-[#39070F]" : "text-gray-400")} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", paymentMethod === "wallet" ? "text-[#39070F]" : "text-gray-700")}>
                  Pay from Wallet
                </p>
                <p className="text-xs text-gray-500">
                  Balance: <span className="font-bold">{formatPrice(walletBalance)}</span>
                  {walletBalance < clientSideTotal && (
                    <span className="text-red-500 ml-1">(Insufficient)</span>
                  )}
                </p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                paymentMethod === "wallet" ? "border-[#39070F]" : "border-gray-300"
              )}>
                {paymentMethod === "wallet" && <div className="h-2.5 w-2.5 rounded-full bg-[#39070F]" />}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("zoho")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all text-left",
                paymentMethod === "zoho"
                  ? "border-[#39070F] bg-[#39070F]/5 ring-1 ring-[#39070F]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <CreditCard className={cn("h-5 w-5 shrink-0", paymentMethod === "zoho" ? "text-[#39070F]" : "text-gray-400")} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", paymentMethod === "zoho" ? "text-[#39070F]" : "text-gray-700")}>
                  Pay with Zoho Pay
                </p>
                <p className="text-xs text-gray-500">
                  Credit/Debit card, UPI, Net Banking
                </p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                paymentMethod === "zoho" ? "border-[#39070F]" : "border-gray-300"
              )}>
                {paymentMethod === "zoho" && <div className="h-2.5 w-2.5 rounded-full bg-[#39070F]" />}
              </div>
            </button>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-700">Total Amount</span>
            <span className="text-xl font-bold text-[#39070F]">
              {formatPrice(clientSideTotal)}
            </span>
          </div>
        </div>

        {/* Section 4: Confirm Button */}
        <div className="px-6 pb-5 pt-2 shrink-0">
          <Button
            onClick={handleConfirmOrder}
            disabled={
              isProcessing ||
              localCartItems.length === 0 ||
              !selectedMealType
            }
            className="w-full rounded-full h-12 text-sm font-semibold bg-[#39070F] hover:bg-[#2D0610] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
