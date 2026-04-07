"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { FaWallet } from "react-icons/fa";

import { useCurrentUser } from "@/hooks/useUserStore";
import { useWalletBalance } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function DashboardTopBar({ className }: { className?: string }) {
  const user = useCurrentUser();
  const { data: balanceData } = useWalletBalance();
  const pathname = usePathname();

  const isProfilePage = pathname === "/profile" || pathname?.startsWith("/profile/");
  const balance = balanceData?.balance ?? 0;
  const avatarUrl = user?.avatar_url ?? null;
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <header
      className={cn(
        "flex items-center justify-between bg-background px-6 py-3 md:px-8",
        className,
      )}
    >
      {/* Right — wallet + bell + avatar (hidden on profile page) */}
      {!isProfilePage && (
        <div className="ml-auto flex items-center gap-4">
          {/* Wallet balance */}
          <Link
            href="/wallet"
            className="flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-1">
              <FaWallet className="h-4 w-4 text-primary" />
            </div>
            <span>{currencyFormatter.format(balance)}</span>
          </Link>

          {/* Notification bell */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:border-primary/30 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-foreground" />
          </button>

          {/* Avatar */}
          <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-border shadow-sm">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={user?.name ?? "Profile"}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
