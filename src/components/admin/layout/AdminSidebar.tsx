"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Store,
  Users,
  Shield,
  ChefHat,
  Calendar,
  CalendarDays,
  UtensilsCrossed,
  ClipboardList,
  Route,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

import { useAuthHydrated, useIsAuthenticated } from "@/hooks/useUserStore";
import { useLogout } from "@/api/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { PermissionNavItem } from "./PermissionNavItem";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  permission?: string | string[];
  requireAll?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        href: "/admin/outlets",
        icon: Store,
        label: "Outlets",
        permission: "outlet:view:any",
        requireAll: true,
      },
      {
        href: "/admin/users",
        icon: Users,
        label: "Users",
        permission: ["user:view:any", "user:view:outlet"],
        requireAll: false,
      },
      {
        href: "/admin/permissions",
        icon: Shield,
        label: "Permissions",
        permission: "permission:view",
        requireAll: true,
      },
    ],
  },
  {
    label: "Kitchen",
    items: [
      {
        href: "/admin/recipes",
        icon: ChefHat,
        label: "Recipes",
        permission: "recipe:view",
        requireAll: true,
      },
      {
        href: "/admin/templates",
        icon: Calendar,
        label: "Templates",
        permission: "template:manage",
        requireAll: true,
      },
      {
        href: "/admin/overrides",
        icon: CalendarDays,
        label: "Overrides",
        permission: "override:manage",
        requireAll: true,
      },
      {
        href: "/admin/kitchen",
        icon: UtensilsCrossed,
        label: "Kitchen Report",
        permission: "order:kitchen",
        requireAll: true,
      },
      {
        href: "/admin/orders",
        icon: ClipboardList,
        label: "Orders",
        permission: "order:view:outlet",
        requireAll: true,
      },
    ],
  },
  {
    label: "Subscriptions",
    items: [
      {
        href: "/admin/plans",
        icon: CreditCard,
        label: "Plans",
        permission: ["subscription:view:any", "subscription:view:outlet"],
        requireAll: false,
      },
      {
        href: "/admin/subscriptions",
        icon: CalendarCheck,
        label: "Subscriptions",
        permission: ["subscription:view:any", "subscription:view:outlet"],
        requireAll: false,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/admin/routes",
        icon: Route,
        label: "Routes",
        permission: "route:assign",
        requireAll: true,
      },
      {
        href: "/admin/reports",
        icon: BarChart3,
        label: "Reports",
        permission: "report:outlet",
        requireAll: true,
      },
      {
        href: "/admin/settings",
        icon: Settings,
        label: "Settings",
        permission: ["config:system", "config:outlet"],
        requireAll: false,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const logoutMutation = useLogout();

  const handleLogout = () => logoutMutation.mutate();

  // Find which group contains the active route
  const activeGroupIndex = useMemo(() => {
    return ADMIN_NAV_GROUPS.findIndex((group) =>
      group.items.some((item) =>
        item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href)
      )
    );
  }, [pathname]);

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <ShadcnSidebar
      collapsible="icon"
      className="w-60 border-r border-border shadow-none"
    >
      <SidebarHeader className="border-none px-6 pt-8 pb-4 group-data-[collapsible=icon]:px-2">
        <Link
          href="/admin"
          className="flex items-center gap-3 active:opacity-90 transition-opacity"
        >
          <Image
            src="/logo-tranparent.png"
            alt="Mullai Kitchen Admin"
            width={150}
            height={40}
            className="h-auto w-full rounded group-data-[collapsible=icon]:hidden"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full overflow-y-auto gap-0">
        {ADMIN_NAV_GROUPS.map((group, groupIdx) => (
          <Collapsible
            key={group.label}
            defaultOpen={groupIdx === activeGroupIndex}
          >
            <SidebarGroup className="px-3 py-1">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden cursor-pointer select-none text-sidebar-foreground/40 text-xs font-semibold uppercase tracking-wider px-2 mb-1 hover:text-sidebar-foreground/70 transition-colors [&>svg]:transition-transform [&>svg]:duration-200">
                  <span>{group.label}</span>
                  <ChevronRight className="ml-auto h-3 w-3 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                    {group.items.map((item) => {
                      const isActive =
                        item.href === "/admin"
                          ? pathname === "/admin"
                          : pathname.startsWith(item.href);

                      return (
                        <PermissionNavItem
                          key={item.href}
                          permission={item.permission}
                          requireAll={item.requireAll}
                        >
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={item.label}
                              className={cn(
                                "h-10 w-full rounded-lg px-3 flex items-center gap-3 transition-all duration-200 group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0",
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                              )}
                            >
                              <Link
                                href={item.href}
                                className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center"
                              >
                                <item.icon className="h-[18px] w-[18px] shrink-0" />
                                <span className="text-sm font-medium whitespace-nowrap group-data-[collapsible=icon]:hidden">
                                  {item.label}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </PermissionNavItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}

        <div className="mt-auto px-4 pb-6">
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn(
              "w-full h-10 justify-start gap-3 px-3 rounded-lg group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
              "text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10",
              "transition-all duration-200 text-sm font-medium"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
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
