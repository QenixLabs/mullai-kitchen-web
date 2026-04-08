"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { useCurrentUser } from "@/hooks/useUserStore";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Get the page title based on the current pathname
 */
function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);

  // Handle /admin or /admin/ -> Dashboard
  if (segments.length <= 1) {
    return "Dashboard";
  }

  // Get the last meaningful segment
  const lastSegment = segments[segments.length - 1];

  // Map common paths to friendly names
  const titleMap: Record<string, string> = {
    outlets: "Outlets",
    users: "Users",
    permissions: "Permissions",
    recipes: "Recipes",
    templates: "Templates",
    kitchen: "Kitchen Report",
    orders: "Orders",
    routes: "Routes",
    reports: "Reports",
    settings: "Settings",
  };

  return titleMap[lastSegment] || formatTitle(lastSegment);
}

/**
 * Format a slug into a title case string
 */
function formatTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface AdminHeaderProps {
  className?: string;
}

export function AdminHeader({ className }: AdminHeaderProps) {
  const user = useCurrentUser();
  const pathname = usePathname();

  const pageTitle = getPageTitle(pathname);
  const avatarUrl = user?.avatar_url ?? null;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header
      className={cn(
        "flex items-center justify-between bg-background px-4 py-3 md:px-6 border-b border-border",
        className
      )}
    >
      {/* Left side - Mobile menu toggle and page title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right side - User avatar */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-border shadow-sm">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={user?.name ?? "Profile"}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
