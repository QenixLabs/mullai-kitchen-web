"use client";

import { motion } from "motion/react";
import { Lock, Laptop, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AccountSecurity() {
  const router = useRouter();

  return (
    <div className="rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 overflow-hidden">
      {/* Password Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-foreground">Password</h4>
            <p className="text-xs text-muted-foreground font-medium">
              Last changed recently
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 sm:ml-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/auth/forgot-password")}
            className="rounded-2xl h-11 px-6 border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80"
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Active Sessions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-foreground">
              Active Sessions
            </h4>
            <p className="text-xs text-muted-foreground font-medium">
              1 device connected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 sm:ml-auto">
          <Button
            variant="outline"
            className="rounded-2xl h-11 px-6 border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-secondary/80"
          >
            Manage Sessions
          </Button>
        </div>
      </div>
    </div>
  );
}
