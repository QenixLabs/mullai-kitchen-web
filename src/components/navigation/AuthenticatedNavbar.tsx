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
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-sm font-bold tracking-wide text-gray-900 sm:text-base">
          Mullai Kitchen
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm",
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{user?.name ?? user?.email ?? "Customer"}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-border text-primary hover:bg-accent"
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
