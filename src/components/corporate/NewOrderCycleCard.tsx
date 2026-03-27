"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewOrderCycleCard() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/corporate/create-order")}
      className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-primary/50 bg-accent/5 transition-all min-h-[280px] w-full hover:border-primary hover:bg-accent/10"
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Plus className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-[#44151C]">New Order Cycle</p>
        <p className="text-sm text-muted-foreground mt-1">
          Configure a new meal partnership for a corporate client.
        </p>
      </div>
    </button>
  );
}
