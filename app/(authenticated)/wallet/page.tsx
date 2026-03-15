"use client";

import { useState } from "react";
import {
  FaArrowLeft,
  FaCreditCard,
  FaQuestionCircle,
  FaInfoCircle,
  FaSyncAlt,
  FaWallet,
} from "react-icons/fa";
import { motion } from "motion/react";
import type {
  TopupWalletResponse,
} from "@/api/types/payment.types";
import type { ZohoPaymentResponse, ZohoPaymentError } from "@/lib/zoho-payments";

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
import { loadZohoPaymentsScript, openZohoCheckout } from "@/lib/zoho-payments";
import { useCurrentUser } from "@/hooks/useUserStore";
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
      // Step 1: Create Zoho payment session
      const order: TopupWalletResponse = await topupMutation.mutateAsync({
        amount,
      });

      console.log("=== Top-up Debug ====");
      console.log("Zoho Payment Session created:", order.paymentSessionId);

      // Step 2: Load Zoho Payments script
      await loadZohoPaymentsScript();

      // Step 3: Close the modal FIRST so the overlay doesn't block the Zoho popup
      setIsAddFundsOpen(false);

      // Step 4: Open Zoho checkout
      openZohoCheckout({
        accountId: order.providerAccountId,
        apiKey: process.env.NEXT_PUBLIC_ZOHO_API_KEY || '',
        paymentSessionId: order.paymentSessionId,
        customer: {
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
        },
        theme: {
          color: "#39070F",
        },
        onSuccess: (response: ZohoPaymentResponse) => {
          console.log("Payment successful:", response);
          setIsTopupProcessing(false);
          setTopupAmount("");
          refetchBalance();
          refetchTransactions();
        },
        onFailure: (error: ZohoPaymentError) => {
          console.error("Payment failed:", error);
          alert(`Payment failed: ${error.description}`);
          setIsTopupProcessing(false);
        },
        onDismiss: () => {
          console.log("Payment modal dismissed");
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
                <FaArrowLeft className="h-5 w-5" />
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
                <FaInfoCircle className="h-5 w-5 text-accent" />
                About Your Wallet
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <FaWallet className="h-4 w-4 text-primary" />
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
                    <FaSyncAlt className="h-4 w-4 text-accent-foreground" />
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
                    <FaCreditCard className="h-4 w-4 text-accent-foreground" />
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
                  <FaQuestionCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 px-6 py-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <DialogHeader className="relative z-10 space-y-3">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                <FaWallet className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <DialogTitle className="text-2xl font-bold text-white">
                  Add Funds
                </DialogTitle>
                <DialogDescription className="text-white/80 mt-1 text-sm">
                  Top up your wallet securely
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Amount Input */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                Enter Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  min="1"
                  step="1"
                  className="h-16 pl-12 pr-4 text-3xl font-bold text-gray-900 placeholder:text-gray-300 border-2 border-gray-100 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Quick Select Chips */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Quick Select
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTopupAmount(amount.toString())}
                    className={cn(
                      "relative py-2.5 px-2 rounded-lg text-sm font-semibold transition-all duration-200",
                      "border-2 hover:scale-105 active:scale-95",
                      topupAmount === amount.toString()
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                        : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    )}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <FaInfoCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed">
                You will be redirected to our secure payment partner to complete the transaction.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 pb-6 pt-2">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseAddFunds}
                disabled={isTopupProcessing}
                className="flex-1 h-12 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTopup}
                disabled={!topupAmount || parseFloat(topupAmount) <= 0 || isTopupProcessing}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {isTopupProcessing ? (
                  <span className="flex items-center gap-2">
                    <FaSyncAlt className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
              ) : (
                <span className="flex items-center gap-2">
                  Proceed
                </span>
              )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
