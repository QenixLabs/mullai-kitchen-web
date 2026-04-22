"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const logoutMutation = useLogout();

  const handleLogout = () => logoutMutation.mutate();

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden rounded-br-[9px] rounded-tr-[9px] px-4 py-1 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#44151c" }}
      >
        {/* Logo */}
        <div className="flex h-[85px] shrink-0 items-start pb-10 pt-2">
          <Link href="/admin" className="block w-full" onClick={onMobileClose}>
            <Image
              src="/logo-tranparent.png"
              alt="Mullai Kitchen Admin"
              width={211}
              height={85}
              className="h-auto w-[211px] object-cover"
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-1">
              {/* Group Label */}
              <div className="flex h-6 items-center rounded-lg px-2.5 py-3">
                <div className="flex flex-1 items-center justify-between">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[1.1px]"
                    style={{ color: "rgba(251,251,251,0.54)" }}
                  >
                    {group.label}
                  </span>
                  <ChevronRight
                    className="h-3 w-3 shrink-0"
                    style={{ color: "rgba(251,251,251,0.54)" }}
                  />
                </div>
              </div>

              {/* Group Items */}
              <div className="flex flex-col gap-0.5">
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
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-white font-semibold shadow-sm"
                            : "hover:bg-white/10"
                        )}
                        style={
                          isActive
                            ? { color: "#44151c" }
                            : { color: "rgba(251,251,251,0.76)" }
                        }
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    </PermissionNavItem>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <div className="mt-auto pb-4 pt-2">
            <div
              className="mb-2 border-t"
              style={{ borderColor: "rgba(251,251,251,0.5)" }}
            />
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-white/10"
              style={{ color: "rgba(251,251,251,0.76)" }}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span>
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
