"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusCircle,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";
import {
  FaCalendarWeek,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";
import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/use-user-store";
import { useLogout } from "@/api/hooks/useAuth";
import { useWalletBalance } from "@/api/hooks/usePayment";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { href: "/subscription", icon: FaCalendarWeek, label: "Subscriptions" },
  { href: "/plans", icon: FaChartLine, label: "Plans" },
  { href: "/wallet", icon: FaWallet, label: "Wallet" },
  { href: "/add-ons", icon: PlusCircle, label: "Add-ons" },
  { href: "/profile", icon: Settings, label: "Settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const logoutMutation = useLogout();
  const { data: balanceData } = useWalletBalance();

  const handleLogout = () => logoutMutation.mutate();

  if (!hasHydrated || !isAuthenticated) return null;

  const currentBalance = balanceData?.balance ?? 0;
  const formattedBalance = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(currentBalance);

  return (
    <ShadcnSidebar className="w-60 border-r border-border bg-muted/30 shadow-none">
      <SidebarHeader className="bg-muted/30 border-none px-6 pt-8 pb-4">
        <Link href="/subscription" className="flex items-center gap-3 active:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Mullai Kitchen" className="h-auto w-full rounded" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full bg-muted/30">
        <SidebarGroup className="mt-2 px-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-12 w-full transition-all duration-200 rounded-sm px-4 flex items-center gap-4",
                        isActive
                          ? "bg-primary! text-primary-foreground! shadow-sm font-bold"
                          : "text-muted-foreground hover:bg-accent hover:text-primary",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-4 w-full"
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive
                              ? "text-primary-foreground!"
                              : "text-muted-foreground group-hover/menu-item:text-primary",
                          )}
                        />
                        <span className="font-semibold text-base whitespace-nowrap">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto px-4 pb-6">
          <div className="rounded-sm bg-primary p-6 shadow-sm">
            <p className="text-sm font-medium text-primary-foreground/90">
              Wallet Balance
            </p>
            <h3 className="mt-1 text-2xl font-bold text-primary-foreground tracking-tight">
              {formattedBalance}
            </h3>
            <Button
              className="mt-4 w-full h-10 bg-background text-primary hover:bg-background/95 rounded-sm font-bold text-sm shadow-sm transition-all border-none"
              variant="secondary"
              asChild
            >
              <Link href="/wallet">
                <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                Top Up Now
              </Link>
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn(
              "mt-4 w-full h-11 justify-start gap-4 px-4 rounded-sm",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-all duration-200 font-semibold text-base"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {logoutMutation.isPending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
