"use client";

import { useState } from "react";
import React from "react";
import {
  ArrowLeft,
  HelpCircle,
  Info,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";

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
  useWalletBalance,
  useWalletTransactions,
} from "@/api/hooks/usePayment";

export default function WalletPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-stone-100">
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
            <WalletBalanceCard />

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
                    <Wallet className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Add Funds
                    </p>
                    <p className="text-gray-600">
                      Contact customer support to add funds to your wallet.
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
