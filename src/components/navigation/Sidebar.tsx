"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Layers,
  Wallet,
  PlusCircle,
  Settings,
  Plus,
  LogOut,
  LayoutGrid,
  UtensilsCrossed,
} from "lucide-react";
import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/use-user-store";
import { useLogout } from "@/api/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const SIDEBAR_ITEMS = [
  { href: "/subscription", icon: Calendar, label: "Subscriptions" },
  { href: "/plans", icon: LayoutGrid, label: "Plans" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
  { href: "/add-ons", icon: PlusCircle, label: "Add-ons" },
  { href: "/settings", icon: Settings, label: "Settings" },
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
    <ShadcnSidebar className="w-60 border-r border-border bg-muted/30 shadow-none">
      <SidebarHeader className="bg-muted/30 border-none px-6 pt-8 pb-4">
        <Link
          href="/subscription"
          className="flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/20">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">
            Mullai Kitchen
          </span>
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
                        "h-12 w-full transition-all duration-200 rounded-lg px-4 flex items-center gap-4",
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
                              : "text-muted-foreground group-hover:text-primary",
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

        <div className="mt-auto px-4 pb-10">
          <div className="rounded-lg bg-primary p-6 shadow-sm">
            <p className="text-sm font-medium text-primary-foreground/90">
              Wallet Balance
            </p>
            <h3 className="mt-1 text-2xl font-bold text-primary-foreground tracking-tight">
              ₹1,240.50
            </h3>
            <Button
              className="mt-4 w-full h-10 bg-background text-primary hover:bg-background/95 rounded-lg font-bold text-sm shadow-sm transition-all border-none"
              variant="secondary"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
              Top Up Now
            </Button>
          </div>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
