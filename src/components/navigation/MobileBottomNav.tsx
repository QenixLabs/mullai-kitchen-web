"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Utensils,
  User,
  LogOut,
} from "lucide-react";
import { useAuthHydrated, useIsAuthenticated } from "@/hooks/use-user-store";
import { useLogout } from "@/api/hooks/useAuth";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ITEMS = [
  { href: "/subscription", icon: Calendar, label: "Subscription" },
  { href: "/plans", icon: Utensils, label: "Plans" },
  { href: "/profile", icon: User, label: "Profile" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const logoutMutation = useLogout();

  const handleLogout = () => logoutMutation.mutate();

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/plans" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("h-6 w-6", isActive ? "scale-110" : "")} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className={cn(
          "flex flex-col items-center gap-1 text-muted-foreground transition-all hover:text-foreground",
          logoutMutation.isPending && "pointer-events-none opacity-50",
        )}
      >
        <LogOut className="h-6 w-6" />
        <span className="text-xs font-medium">
          {logoutMutation.isPending ? "..." : "Logout"}
        </span>
      </button>
    </nav>
  );
}
