"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  HelpCircle,
  Info,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import type {
  TopupWalletResponse,
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
  DialogHeader,
  DialogTitle,
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

export default function WalletPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [isTopupProcessing, setIsTopupProcessing] = useState(false);
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
    setTopupAmount("");
    setIsAddFundsOpen(true);
  };

  const handleCloseAddFunds = () => {
    setIsAddFundsOpen(false);
    setTopupAmount("");
  };

  const handleTopup = async () => {
    const amount = parseFloat(topupAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsTopupProcessing(true);
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
      setIsAddFundsOpen(false);

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
          setIsTopupProcessing(false);
          setTopupAmount("");
          refetchBalance(); // Refresh wallet balance
          refetchTransactions(); // Refresh transactions
        },
        onDismiss: () => {
          console.log("Payment modal dismissed");
          setIsTopupProcessing(false);
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          alert(`Payment failed: ${error.description}`);
          setIsTopupProcessing(false);
        },
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Top-up failed:", error);
      alert(`Failed to initiate payment: ${error.message || "Unknown error"}`);
    } finally {
      setIsTopupProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
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
              isTopupProcessing={isTopupProcessing}
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
            {/* Wallet Info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <Info className="h-5 w-5 text-accent" />
                About Your Wallet
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Wallet className="h-4 w-4 text-primary" />
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <RefreshCw className="h-4 w-4 text-accent-foreground" />
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <CreditCard className="h-4 w-4 text-accent-foreground" />
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

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Add Funds to Wallet
            </DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to your wallet. You will be redirected to complete the payment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                placeholder="Enter amount"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                min="1"
                step="1"
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              {[100, 500, 1000, 2000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTopupAmount(amount.toString())}
                  className={cn(
                    "flex-1 transition-all duration-200",
                    topupAmount === amount.toString() && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCloseAddFunds}
              className="flex-1"
              disabled={isTopupProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopup}
              disabled={!topupAmount || parseFloat(topupAmount) <= 0 || isTopupProcessing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isTopupProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Pay"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
