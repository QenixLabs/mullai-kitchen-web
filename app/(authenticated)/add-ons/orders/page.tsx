"use client";

import { OrderHistoryList } from "@/components/customer/add-ons";

export default function OrderHistoryPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-1 text-[28px] font-black uppercase leading-none tracking-tight text-[#3A1018] sm:text-[32px] lg:text-[34px]">
          ORDER HISTORY
        </h1>
        <p className="text-sm text-[#3B3336] sm:text-base">
          View and track all your add-on orders.
        </p>
      </div>

      <OrderHistoryList />
    </div>
  );
}
