"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, User, LogOut } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { href: "/corporate", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/corporate/create-order", icon: PlusCircle, label: "Create Order" },
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
    <ShadcnSidebar className="w-60 border-r border-border bg-muted/30 shadow-none">
      <SidebarHeader className="bg-muted/30 border-none px-6 pt-8 pb-4">
        <Link
          href="/corporate"
          className="flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="Mullai Kitchen Corporate"
            className="h-auto w-full rounded"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full bg-muted/30">
        <SidebarGroup className="mt-2 px-3">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = pathname === item.href;

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
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn(
              "mt-4 w-full h-11 justify-start gap-4 px-4 rounded-sm",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "transition-all duration-200 font-semibold text-base",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {logoutMutation.isPending ? "Logging out..." : "Sign out"}
          </Button>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
