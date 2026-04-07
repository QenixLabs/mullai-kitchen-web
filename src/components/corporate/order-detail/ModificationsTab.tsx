"use client";

import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, History, Package, PiggyBank, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ICorporateOrderModification } from "@/api/types/corporate.types";

interface ModificationsTabProps {
  modifications: ICorporateOrderModification[];
}

function formatDateTime(dateStr: string): { date: string; meta: string } {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date, meta: `${weekday} • ${time}` };
}

function ChangeBadge({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600">
        — 0
      </span>
    );
  }

  // change > 0 = reduction (fewer meals = credit = good)
  // change < 0 = addition (more meals = charge)
  const isReduction = change > 0;
  const displayValue = Math.abs(change);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        isReduction
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700",
      )}
    >
      {isReduction ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <ArrowUp className="h-3 w-3" />
      )}
      {isReduction ? "-" : "+"}
      {displayValue}
    </span>
  );
}

function AmountDisplay({ amount }: { amount: number }) {
  if (amount === 0) {
    return <span className="text-sm font-bold text-muted-foreground">₹0</span>;
  }

  // amount > 0 = credit from reduction
  // amount < 0 = charge from addition
  const isCredit = amount > 0;

  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "text-sm font-bold",
          isCredit ? "text-emerald-600" : "text-amber-600",
        )}
      >
        <span className="align-top text-xs">₹</span>
        {Math.abs(amount).toLocaleString("en-IN")}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold uppercase tracking-wider",
          isCredit ? "text-emerald-500" : "text-amber-500",
        )}
      >
        {isCredit ? "Credit" : "Charge"}
      </span>
    </div>
  );
}

export function ModificationsTab({ modifications }: ModificationsTabProps) {
  const totalAdjustment = modifications.reduce(
    (sum, mod) => sum + mod.modification_amount,
    0,
  );
  const isNetCredit = totalAdjustment >= 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Adjustment Card */}
        <div
          className={cn(
            "rounded-2xl p-6",
            isNetCredit
              ? "bg-emerald-50"
              : "bg-amber-50",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                isNetCredit
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              <PiggyBank className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wide",
                  isNetCredit
                    ? "text-emerald-700/70"
                    : "text-amber-700/70",
                )}
              >
                {isNetCredit ? "Total Credit" : "Total Additional Charge"}
              </p>
              <div
                className={cn(
                  "mt-1 text-3xl font-bold",
                  isNetCredit ? "text-emerald-900" : "text-amber-900",
                )}
              >
                <span className="align-top text-xl">₹</span>
                {Math.abs(totalAdjustment).toLocaleString("en-IN")}
              </div>
              <div className="mt-3">
                <span className="text-xs text-muted-foreground">
                  {isNetCredit
                    ? "Credit from meal reductions"
                    : "Charge from meal additions"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Adjustments Card */}
        <div className="rounded-2xl bg-primary text-primary-foreground p-6">
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">
            Total Adjustments
          </p>
          <div className="mt-1 text-3xl font-bold">
            {modifications.length}{" "}
            <span className="text-base font-medium opacity-80">entries</span>
          </div>
          <div className="mt-4 h-1 w-full rounded-full bg-primary-foreground/20 overflow-hidden" />
        </div>
      </div>

      {/* History Log Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
            <History className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-foreground">History Log</h2>
        </div>

        {modifications.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-white overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Execution Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Veg Change
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Non-Veg Change
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Context
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {modifications.map((mod, index) => {
                      const { date, meta } = formatDateTime(
                        mod.modification_date,
                      );
                      return (
                        <motion.tr
                          key={mod._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.04 }}
                          className={cn(
                            "group transition-colors",
                            index !== modifications.length - 1 &&
                              "border-b border-border/50",
                          )}
                        >
                          <td className="px-6 py-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {date}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {meta}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <ChangeBadge change={mod.veg_change} />
                          </td>

                          <td className="px-6 py-4 align-top">
                            <ChangeBadge change={mod.nonveg_change} />
                          </td>

                          <td className="px-6 py-4 align-top">
                            <AmountDisplay amount={mod.modification_amount} />
                          </td>

                          <td className="px-6 py-4 align-top">
                            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  mod.status === "approved"
                                    ? "bg-emerald-500"
                                    : mod.status === "rejected"
                                      ? "bg-destructive"
                                      : "bg-muted-foreground",
                                )}
                              />
                              {mod.status === "approved"
                                ? "Settled"
                                : mod.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                              <span className="text-muted-foreground/70">&quot;</span>
                              <span className="mx-0.5">
                                {mod.reason || "No comment provided"}
                              </span>
                              <span className="text-muted-foreground/70">
                                &quot;
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-border py-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                End of modification history
              </span>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-14">
            <Package className="mb-3 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              End of modification history
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
