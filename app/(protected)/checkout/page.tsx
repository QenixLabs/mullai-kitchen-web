"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  PlusCircle,
  QrCode,
  Shield,
  Wallet,
} from "lucide-react";
import { useStore } from "zustand";

import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { createPlanIntentStore } from "@/stores/plan-intent-store";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type PaymentMethod = "wallet" | "card" | "upi";

interface MockAddress {
  id: string;
  label: string;
  line1: string;
  line2: string;
  country: string;
  isDefault?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: "home",
    label: "Home",
    line1: "123 Main St, Apartment 4B",
    line2: "New York, NY 10001",
    country: "United States",
    isDefault: true,
  },
  {
    id: "work",
    label: "Work",
    line1: "456 Business Ave, Floor 12",
    line2: "New York, NY 10010",
    country: "United States",
  },
];

const DELIVERY_FEE = 12.5;
const ESTIMATED_TAXES_RATE = 0.05;

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({
  step,
  label,
  active,
}: {
  step: number;
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
          active
            ? "bg-orange-500 text-white shadow-md shadow-orange-200"
            : "border-2 border-gray-300 bg-white text-gray-400",
        )}
      >
        {step}
      </div>
      <span
        className={cn(
          "text-xs font-semibold",
          active ? "text-orange-500" : "text-gray-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function AddressCard({
  address,
  selected,
  onClick,
}: {
  address: MockAddress;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-orange-400 bg-orange-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/40",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          {address.label}
          {address.isDefault && selected && (
            <CheckCircle2 className="h-3.5 w-3.5 text-orange-500" />
          )}
        </span>
        <Pencil className="h-3.5 w-3.5 text-gray-400" />
      </div>
      <p className="text-xs text-gray-600">{address.line1}</p>
      <p className="text-xs text-gray-600">{address.line2}</p>
      <p className="text-xs text-gray-500">{address.country}</p>
    </button>
  );
}

function AddNewAddressCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center transition-all hover:border-orange-300 hover:bg-orange-50/40"
    >
      <PlusCircle className="h-6 w-6 text-gray-400" />
      <span className="text-sm font-medium text-gray-500">Add New Address</span>
    </button>
  );
}

function PaymentOption({
  id,
  label,
  subtitle,
  icon,
  badge,
  selected,
  onClick,
}: {
  id: PaymentMethod;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-orange-400 bg-orange-50/60"
          : "border-gray-200 bg-white hover:border-orange-200",
      )}
    >
      {/* Radio circle */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-orange-500 bg-orange-500" : "border-gray-300",
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>

      <div className="flex shrink-0 items-center justify-center">{icon}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {badge}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  const [planIntentStore] = useState(() => createPlanIntentStore());

  const planId = useStore(planIntentStore, (s) => s.planId);
  const plan = useStore(planIntentStore, (s) => s.plan);

  const hasPlanIntent = Boolean(planId && plan);

  const [selectedAddressId, setSelectedAddressId] = useState("home");
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentMethod>("wallet");
  const WALLET_BALANCE = 145.2;

  // Auth + intent guards
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace("/auth/signin?redirect=/checkout");
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    if (!hasPlanIntent) router.replace("/plans");
  }, [hasHydrated, hasPlanIntent, isAuthenticated, router]);

  // Loading / redirect states
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]">
        <p className="text-sm text-gray-500">
          Preparing your checkout session…
        </p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]">
        <p className="text-sm text-gray-500">Redirecting to sign in…</p>
      </div>
    );
  }
  if (!hasPlanIntent || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]">
        <p className="text-sm text-gray-500">Redirecting to plans…</p>
      </div>
    );
  }

  // Pricing
  const subtotal = plan.price;
  const taxes = parseFloat((subtotal * ESTIMATED_TAXES_RATE).toFixed(2));
  const total = subtotal + DELIVERY_FEE + taxes;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Progress Steps ──────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 pb-2 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-0">
          <StepIndicator step={1} label="Delivery Details" active />

          {/* connector line */}
          <div className="mx-3 h-0.5 w-24 bg-gradient-to-r from-orange-400 to-gray-200 sm:w-40" />

          <StepIndicator step={2} label="Payment & Review" active={false} />
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* ─── Left column ───────────────────────────────── */}
          <div className="flex-1 space-y-5">
            {/* 1. Select Delivery Address */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
                1. Select Delivery Address
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MOCK_ADDRESSES.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selected={selectedAddressId === addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                  />
                ))}
                <AddNewAddressCard onClick={() => {}} />
              </div>
            </section>

            {/* Two-Phase Wallet info banner */}
            <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500">
                <Info className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Two-Phase Wallet Reservation
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                  Funds are first reserved in your Mullai Wallet to secure your
                  subscription. Deductions from your actual balance occur only
                  upon delivery confirmation.{" "}
                  <button
                    type="button"
                    className="font-medium text-orange-500 hover:underline"
                  >
                    Learn more about how it works.
                  </button>
                </p>
              </div>
            </div>

            {/* 2. Payment Selection */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 sm:text-lg">
                <CreditCard className="h-5 w-5 text-orange-500" />
                2. Payment Selection
              </h2>

              <div className="space-y-3">
                {/* Mullai Wallet */}
                <PaymentOption
                  id="wallet"
                  label="Mullai Wallet"
                  subtitle={`Balance: $${WALLET_BALANCE.toFixed(2)}`}
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                      <Wallet className="h-4 w-4 text-orange-600" />
                    </div>
                  }
                  badge={
                    <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                      Recommended
                    </span>
                  }
                  selected={selectedPayment === "wallet"}
                  onClick={() => setSelectedPayment("wallet")}
                />

                {/* Credit / Debit Card */}
                <PaymentOption
                  id="card"
                  label="Credit / Debit Card"
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                  }
                  selected={selectedPayment === "card"}
                  onClick={() => setSelectedPayment("card")}
                />

                {/* UPI */}
                <PaymentOption
                  id="upi"
                  label="UPI (PhonePe, GPay, etc.)"
                  icon={
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <QrCode className="h-4 w-4 text-gray-500" />
                    </div>
                  }
                  selected={selectedPayment === "upi"}
                  onClick={() => setSelectedPayment("upi")}
                />
              </div>
            </section>
          </div>

          {/* ─── Right sidebar ─────────────────────────────── */}
          <div className="w-full space-y-4 lg:w-72 xl:w-80">
            {/* Order Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-base font-bold text-gray-900">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                {/* Plan row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      Monthly Subscription Plan
                    </p>
                    <p className="text-xs text-gray-500">
                      {plan.name} ({plan.duration})
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Delivery Fee */}
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1">
                    Delivery Fee
                    <Info className="h-3 w-3 text-gray-400" />
                  </span>
                  <span className="font-medium text-gray-800">
                    ${DELIVERY_FEE.toFixed(2)}
                  </span>
                </div>

                {/* Taxes */}
                <div className="flex items-center justify-between text-gray-600">
                  <span>Estimated Taxes</span>
                  <span className="font-medium text-gray-800">
                    ${taxes.toFixed(2)}
                  </span>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Total */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Total to Reserve
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="mt-0.5 text-3xl font-extrabold text-gray-900">
                      ${total.toFixed(2)}
                    </p>
                    <p className="pb-1 text-right text-[10px] leading-tight text-gray-400">
                      Monthly auto-renewal
                      <br />
                      on 15th of each month
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
                >
                  Pay &amp; Subscribe
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> PCI-DSS
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> 256-BIT
                  </span>
                </div>
              </div>
            </div>

            {/* Help chat */}
            <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                  <MessageCircle className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Need help with payment?
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Our concierge is available 24/7
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-orange-500 underline underline-offset-2 hover:text-orange-600"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delivery zones map footer ─────────────────────── */}
      <div className="relative mt-4 h-40 w-full overflow-hidden sm:h-48">
        <iframe
          title="Mullai Kitchen Delivery Zones"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-74.05%2C40.68%2C-73.90%2C40.82&layer=mapnik"
          className="h-full w-full border-0 opacity-60 grayscale"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <p className="rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white">
            Delivering to 12 Neighborhood Zones Across Manhattan
          </p>
        </div>
      </div>
    </div>
  );
}
