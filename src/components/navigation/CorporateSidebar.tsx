"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, User, LogOut } from "lucide-react";
import {
  useAuthHydrated,
  useIsAuthenticated,
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { href: "/corporate", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/corporate/orders", icon: ClipboardList, label: "Orders" },
  { href: "/corporate/profile", icon: User, label: "Profile" },
] as const;

export function CorporateSidebar() {
  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const logoutMutation = useLogout();

  const handleLogout = () => logoutMutation.mutate();

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <ShadcnSidebar collapsible="icon" className="w-60 border-r border-border shadow-none">
      <SidebarHeader className="border-none px-6 pt-8 pb-4 group-data-[collapsible=icon]:px-2">
        <Link
          href="/corporate"
          className="flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="Mullai Kitchen Corporate"
            className="h-auto w-full rounded group-data-[collapsible=icon]:hidden"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        <SidebarGroup className="mt-2 px-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2.5 group-data-[collapsible=icon]:items-center">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = item.href === "/corporate"
                  ? pathname === "/corporate"
                  : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-12 w-full rounded-full px-4 flex items-center gap-4 transition-all duration-200 group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0",
                        isActive
                          ? "bg-secondary! text-primary! shadow-sm font-bold"
                          : "text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-4 group-data-[collapsible=icon]:justify-center"
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            isActive
                              ? "text-primary!"
                              : "text-sidebar-foreground/70",
                          )}
                        />
                        <span className="font-semibold text-base whitespace-nowrap group-data-[collapsible=icon]:hidden">
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
              "mt-4 w-full h-11 justify-start gap-4 px-4 rounded-sm group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              "text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10",
              "transition-all duration-200 font-semibold text-base"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </span>
          </Button>
        </div>
      </SidebarContent>
      <SidebarRail />
    </ShadcnSidebar>
  );
}
