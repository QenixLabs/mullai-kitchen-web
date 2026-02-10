"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLogout } from "@/api/hooks/useAuth";
import { useCurrentUser } from "@/hooks/use-user-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plans", label: "Plans" },
] as const;

export function AuthenticatedNavbar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const logoutMutation = useLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-sm font-bold tracking-wide text-gray-900 sm:text-base">
          Mullai Kitchen
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-orange-100 bg-orange-50/80 p-1" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm",
                  isActive ? "bg-orange-600 text-white" : "text-gray-700 hover:bg-orange-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-gray-600 sm:inline">{user?.name ?? user?.email ?? "Customer"}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-orange-200 text-orange-700 hover:bg-orange-50"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </header>
  );
}
