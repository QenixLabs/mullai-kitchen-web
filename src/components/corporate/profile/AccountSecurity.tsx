"use client";

import { Lock, Laptop } from "lucide-react";
import { useRouter } from "next/navigation";

export function AccountSecurity() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0px_20px_40px_0px_rgba(61,0,12,0.04)] flex flex-col gap-8">
      {/* Password Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-[#1d1b1c]">Password</h4>
            <p className="text-sm text-[#554243] font-normal">
              Last updated 3 months ago
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/auth/forgot-password")}
          className="shrink-0 border border-border/50 rounded-full px-5 py-2.5 text-xs font-bold text-[#1d1b1c] hover:bg-secondary/80 transition-colors"
        >
          Change Password
        </button>
      </div>

      {/* Active Sessions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-[#1d1b1c]">
              Active Sessions
            </h4>
            <p className="text-sm text-[#554243] font-normal">
              2 active devices currently logged in
            </p>
          </div>
        </div>
        <button className="shrink-0 border border-border/50 rounded-full px-5 py-2.5 text-xs font-bold text-[#1d1b1c] hover:bg-secondary/80 transition-colors">
          Manage Sessions
        </button>
      </div>
    </div>
  );
}
