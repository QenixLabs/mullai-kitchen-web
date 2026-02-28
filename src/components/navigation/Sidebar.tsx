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
    <ShadcnSidebar className="w-[240px] border-r border-gray-100 bg-[#f9fafb] shadow-none">
      <SidebarHeader className="bg-[#f9fafb] border-none px-6 pt-8 pb-4">
        <Link
          href="/subscription"
          className="flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5C00] shadow-md shadow-[#FF5C00]/20">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <span className="text-[20px] font-black tracking-tight text-gray-900">
            Mullai Kitchen
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full bg-[#f9fafb]">
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
                          ? "bg-[#FF5C00]! text-white! shadow-sm font-bold"
                          : "text-gray-600 hover:bg-gray-100 hover:text-[#FF5C00]",
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
                              ? "text-white!"
                              : "text-gray-500 group-hover:text-[#FF5C00]",
                          )}
                        />
                        <span className="font-semibold text-[15px] whitespace-nowrap">
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
          <div className="rounded-xl bg-[#FF5C00] p-6 shadow-sm">
            <p className="text-[13px] font-medium text-white/90">
              Wallet Balance
            </p>
            <h3 className="mt-1 text-2xl font-bold text-white tracking-tight">
              ₹1,240.50
            </h3>
            <Button
              className="mt-4 w-full h-10 bg-white text-[#FF5C00] hover:bg-white/95 rounded-lg font-bold text-sm shadow-sm transition-all border-none"
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
