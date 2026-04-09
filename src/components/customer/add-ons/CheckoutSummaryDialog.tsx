"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, CreditCard, QrCode, UtensilsCrossed, X, AlertCircle } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { usePrepareCheckout, useCreateAddOnOrder } from "@/api/hooks/useAddons";
import { useWalletBalance } from "@/api/hooks/usePayment";
import { toast } from "sonner";
import type { MealType, CheckoutPrepareResponse } from "@/api/types/addons.types";

type PaymentMethod = "WALLET" | "CARD" | "UPI";

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
  subscriptionId: string;
  deliveryDate: string;
  onDeliveryDateChange?: (date: string) => void;
  maxDeliveryDate?: string;
  onOrderSuccess: () => void;
}

export function CheckoutSummaryDialog({
  isOpen,
  onClose,
  cartItems,
  subscriptionId,
  deliveryDate,
  onDeliveryDateChange,
  maxDeliveryDate,
  onOrderSuccess,
}: CheckoutSummaryDialogProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("WALLET");
  const [localCartItems, setLocalCartItems] = useState(cartItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutPrepareResponse | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data: walletData } = useWalletBalance();
  const prepareCheckout = usePrepareCheckout();
  const createOrder = useCreateAddOnOrder();

  // Update local cart when props change
  useEffect(() => {
    setLocalCartItems(cartItems);
  }, [cartItems]);

  // Prepare checkout when dialog opens or cart changes
  useEffect(() => {
    if (isOpen && localCartItems.length > 0 && subscriptionId) {
      setIsCheckoutLoading(true);
      setCheckoutError(null);
      prepareCheckout.mutate(
        {
          subscriptionId,
          data: {
            subscription_id: subscriptionId,
            items: localCartItems.map((item) => ({
              item_id: item.item_id,
              quantity: item.quantity,
              meal_type: item.meal_type,
            })),
            delivery_date: deliveryDate,
            apply_wallet: selectedPayment === "WALLET",
          },
        },
        {
          onSuccess: (data) => {
            setCheckoutData(data);
            setIsCheckoutLoading(false);
            setCheckoutError(null);
          },
          onError: (error: any) => {
            setIsCheckoutLoading(false);
            const msg =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to prepare checkout";
            setCheckoutError(msg);
          },
        }
      );
    }
  }, [isOpen, localCartItems, subscriptionId, deliveryDate, selectedPayment]);

  const walletBalance = walletData?.balance || 0;
  const totalAmount = checkoutData?.total_amount || localCartItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const canPayWithWallet = walletBalance >= totalAmount;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setLocalCartItems((prev) =>
      prev.map((item) =>
        item.item_id === itemId ? { ...item, quantity: newQuantity } : item
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

    if (selectedPayment === "WALLET" && !canPayWithWallet) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createOrder.mutateAsync({
        subscriptionId,
        data: {
          subscription_id: subscriptionId,
          items: localCartItems.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            meal_type: item.meal_type,
          })),
          delivery_date: deliveryDate,
        },
      });

      if (result.success) {
        toast.success("Order placed successfully!", {
          description: `Order #${result.order_id?.slice(-6)} has been confirmed.`,
        });
        onOrderSuccess();
        onClose();
      } else {
        toast.error(result.message || "Failed to place order");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to place order");
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

  const paymentMethods = [
    {
      id: "WALLET" as PaymentMethod,
      label: "Mullai Wallet",
      icon: Wallet,
      description: walletBalance > 0 ? `Current Balance: ${formatPrice(walletBalance)}` : "No balance",
      disabled: false,
    },
    {
      id: "CARD" as PaymentMethod,
      label: "Debit / Credit Card",
      icon: CreditCard,
      description: "",
      disabled: false,
    },
    {
      id: "UPI" as PaymentMethod,
      label: "UPI Payment",
      icon: QrCode,
      description: "",
      disabled: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm w-full max-h-[85vh] flex flex-col p-0 gap-0 bg-[#FAFAFA] border-none rounded-3xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-2 relative shrink-0">
          <DialogTitle className="text-xl font-bold text-[#39070F]">
            Checkout Summary
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Secure your lunch add-ons
          </p>
          <button
            onClick={onClose}
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
              max={maxDeliveryDate}
              className="bg-transparent border-none outline-none text-sm text-foreground"
            />
          </div>
        </div>

        {/* Error Message */}
        {checkoutError && (
          <div className="px-6 pb-2">
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 max-h-[35vh] overflow-y-auto px-6">
          {localCartItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {localCartItems.map((item) => (
                <div key={item.item_id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <UtensilsCrossed className="h-5 w-5 text-gray-600" />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                  </div>

                  {/* Quantity and Price */}
                  <div className="text-right shrink-0 flex items-center gap-4">
                    <span className="text-sm text-gray-500">x{item.quantity}</span>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
            PAYMENT METHOD
          </h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                  selectedPayment === method.id
                    ? "border-[#39070F] bg-[#F5F0F0]"
                    : "border-transparent bg-[#F0F0F0] hover:bg-[#E8E8E8]"
                )}
              >
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <method.icon className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                  {method.description && (
                    <p className="text-xs text-gray-500">{method.description}</p>
                  )}
                </div>
                {/* Radio Circle */}
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedPayment === method.id
                      ? "border-[#39070F] bg-[#39070F]"
                      : "border-gray-400 bg-white"
                  )}
                >
                  {selectedPayment === method.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Total and Button */}
        <div className="px-6 pb-5 pt-2 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-gray-700">Total Amount</span>
            <span className="text-xl font-bold text-[#39070F]">
              {isCheckoutLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                formatPrice(checkoutData?.amount_to_pay || totalAmount)
              )}
            </span>
          </div>

          <Button
            onClick={handleConfirmOrder}
            disabled={
              isProcessing ||
              localCartItems.length === 0 ||
              !!checkoutError
            }
            className="w-full rounded-full h-12 text-sm font-semibold bg-[#39070F] hover:bg-[#2D0610] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              "Proceed to Confirm Order"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
