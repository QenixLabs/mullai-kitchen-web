"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Info,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import type {
  TopupWalletResponse,
  RazorpayOptions,
  RazorpayPaymentResponse,
} from "@/api/types/payment.types";

import { WalletBalanceCard } from "@/components/customer/wallet";
import { TransactionHistory } from "@/components/customer/wallet";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useTopupWallet,
  useWalletBalance,
  useWalletTransactions,
} from "@/api/hooks/usePayment";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { useCurrentUser } from "@/hooks/use-user-store";
import React from "react";

const TOPUP_AMOUNTS = [100, 200, 500, 1000, 2000];

export default function WalletPage() {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [topupProcessing, setTopupProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const topupMutation = useTopupWallet();
  const { refetch: refetchBalance } = useWalletBalance();
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
    isFetching: transactionsFetching,
  } = useWalletTransactions({
    limit,
    offset: (currentPage - 1) * limit,
  });
  const user = useCurrentUser();

  const handleAddFunds = () => {
    setShowAddFundsModal(true);
  };

  const handleTopup = async () => {
    const amount =
      selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    if (amount <= 0) return;

    setTopupProcessing(true);
    try {
      // Step 1: Load Razorpay script first
      await loadRazorpayScript();

      // Step 2: Create Razorpay order
      const order: TopupWalletResponse = await topupMutation.mutateAsync({
        amount,
      });

      console.log("=== Top-up Debug ====");
      console.log("Razorpay Order created:", order.razorpayOrderId);

      // Step 3: Open Razorpay checkout using the shared utility
      // Close the modal FIRST so the overlay doesn't block the Razorpay popup
      setShowAddFundsModal(false);

      openRazorpayCheckout({
        keyId: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        orderId: order.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        onSuccess: (response: RazorpayPaymentResponse) => {
          console.log("Payment successful:", response);
          setTopupProcessing(false);
          setSelectedAmount(null);
          setCustomAmount("");
          refetchBalance(); // Refresh wallet balance
          refetchTransactions(); // Refresh transactions
        },
        onDismiss: () => {
          console.log("Payment modal dismissed");
          setTopupProcessing(false);
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          alert(`Payment failed: ${error.description}`);
          setTopupProcessing(false);
        },
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Top-up failed:", error);
      alert(`Failed to initiate payment: ${error.message || "Unknown error"}`);
    } finally {
      setTopupProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50 to-stone-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-gray-600">
                Manage your funds and view transaction history
              </p>
            </div>

            <Button variant="ghost" size="icon" asChild>
              <a href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <WalletBalanceCard
              onAddFunds={handleAddFunds}
              isTopupProcessing={topupProcessing}
            />

            {/* Transaction History */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <TransactionHistory
                data={transactionsData}
                isLoading={transactionsLoading}
                isFetching={transactionsFetching}
                error={transactionsError as Error}
                refetch={refetchTransactions}
                limit={limit}
                onPageChange={setCurrentPage}
              />

              {/* Pagination */}
              {transactionsData &&
                Math.ceil(transactionsData.total / limit) > 1 && (
                  <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
                    <p className="text-xs text-gray-500">
                      Showing{" "}
                      <span className="font-medium text-gray-900">
                        {(currentPage - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-gray-900">
                        {Math.min(currentPage * limit, transactionsData.total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-gray-900">
                        {transactionsData.total}
                      </span>{" "}
                      transactions
                    </p>

                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1)
                                setCurrentPage(currentPage - 1);
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {/* Generate Page Numbers */}
                        {Array.from(
                          { length: Math.ceil(transactionsData.total / limit) },
                          (_, i) => i + 1,
                        )
                          .filter((page) => {
                            const totalPages = Math.ceil(
                              transactionsData.total / limit,
                            );
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .map((page, index, array) => {
                            const showEllipsisBefore =
                              index > 0 && page - array[index - 1] > 1;

                            return (
                              <React.Fragment key={page}>
                                {showEllipsisBefore && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentPage(page);
                                    }}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          })}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              const totalPages = Math.ceil(
                                transactionsData.total / limit,
                              );
                              if (currentPage < totalPages)
                                setCurrentPage(currentPage + 1);
                            }}
                            className={
                              currentPage ===
                              Math.ceil(transactionsData.total / limit)
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Wallet className="h-5 w-5 text-orange-500" />
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Dialog
                  open={showAddFundsModal}
                  onOpenChange={setShowAddFundsModal}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full bg-orange-600 text-white hover:bg-orange-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:min-w-[480px]">
                    <DialogHeader>
                      <DialogTitle>Add Funds to Wallet</DialogTitle>
                      <DialogDescription>
                        Choose an amount or enter a custom amount to top up your
                        wallet.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Preset Amounts */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {TOPUP_AMOUNTS.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(amount);
                              setCustomAmount("");
                            }}
                            className={cn(
                              "rounded-lg border py-3 text-center text-sm font-semibold transition-all",
                              selectedAmount === amount
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50",
                            )}
                          >
                            ₹{amount}
                          </button>
                        ))}
                      </div>

                      {/* Custom Amount */}
                      <div className="space-y-2">
                        <Label htmlFor="custom-amount">
                          Or enter custom amount
                        </Label>
                        <Input
                          id="custom-amount"
                          type="number"
                          min="10"
                          max="100000"
                          placeholder="Enter amount (₹10 - ₹100,000)"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedAmount(null);
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        <p className="text-xs text-gray-700">
                          Minimum top-up amount is ₹10. Funds will be available
                          immediately after successful payment.
                        </p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddFundsModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleTopup}
                        disabled={
                          topupProcessing || (!selectedAmount && !customAmount)
                        }
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        {topupProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay ₹{selectedAmount || customAmount || "0"}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Info className="h-5 w-5 text-blue-500" />
                About Your Wallet
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
                    <Wallet className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Secure Payment Method
                    </p>
                    <p className="text-gray-600">
                      Your wallet is a secure way to pay for subscriptions and
                      orders. All transactions are encrypted and processed
                      securely.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <RefreshCw className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Auto-Refunds on Pause
                    </p>
                    <p className="text-gray-600">
                      When you pause your subscription, credits for paused days
                      are automatically added back to your wallet.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Flexible Top-up
                    </p>
                    <p className="text-gray-600">
                      Add funds anytime using card, UPI, or other payment
                      methods. No minimum balance required to maintain wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mb-1 text-lg font-bold text-gray-900">
                    Need Help?
                  </h2>
                  <p className="text-sm text-gray-600">
                    Have questions about your wallet?
                  </p>
                </div>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
