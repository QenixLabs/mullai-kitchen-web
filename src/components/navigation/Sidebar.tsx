"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusCircle,
  Settings,
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
} from "@/hooks/useUserStore";
import { useLogout } from "@/api/hooks/useAuth";
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

  const handleLogout = () => logoutMutation.mutate();

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <ShadcnSidebar className="w-60 border-r border-border shadow-none">
      <SidebarHeader className="border-none px-6 pt-8 pb-4">
        <Link href="/subscription" className="flex items-center gap-3 active:opacity-90 transition-opacity">
          <img src="/logo-tranparent.png" alt="Mullai Kitchen" className="h-auto w-full rounded" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
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
                        "h-12 w-full transition-all duration-200 rounded-full px-4 flex items-center gap-4",
                        isActive
                          ? "bg-secondary! text-primary! shadow-sm font-bold"
                          : "text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground",
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
                              ? "text-primary!"
                              : "text-sidebar-foreground/70",
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
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn(
              "mt-4 w-full h-11 justify-start gap-4 px-4 rounded-sm",
              "text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10",
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
