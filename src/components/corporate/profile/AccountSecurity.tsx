"use client";

import { useState } from "react";
import { Lock, Laptop } from "lucide-react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export function AccountSecurity() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6 rounded-3xl bg-white p-5 shadow-[0px_20px_40px_0px_rgba(61,0,12,0.04)] sm:gap-8 sm:p-8">
        {/* Password Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#1d1b1c]">Password</h4>
              <p className="text-sm text-[#554243] font-normal">
                Secure your account with a strong password
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPasswordDialogOpen(true)}
            className="w-full shrink-0 rounded-full border border-border/50 px-5 py-2.5 text-xs font-bold text-[#1d1b1c] transition-colors hover:bg-secondary/80 sm:w-auto"
          >
            Change Password
          </button>
        </div>

        {/* Active Sessions Row */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Laptop className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-[#1d1b1c]">
                Active Sessions
              </h4>
              <p className="text-sm text-[#554243] font-normal">
                Manage devices currently logged into your account
              </p>
            </div>
          </div>
          <button className="shrink-0 border border-border/50 rounded-full px-5 py-2.5 text-xs font-bold text-[#1d1b1c] hover:bg-secondary/80 transition-colors">
            Manage Sessions
          </button>
        </div> */}
      </div>

      {/* Password Change Dialog */}
      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </>
  );
}
