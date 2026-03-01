"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutGrid,
  Wallet,
  Menu,
  User,
  Settings,
  PlusCircle,
  LogOut,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/use-user-store";
import { useLogout } from "@/api/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const MAIN_NAV_ITEMS = [
  { href: "/subscription", icon: Calendar, label: "Subscription" },
  { href: "/plans", icon: LayoutGrid, label: "Plans" },
  { href: "/wallet", icon: Wallet, label: "Wallet" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const logoutMutation = useLogout();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    logoutMutation.mutate();
  };

  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-[92%] -translate-x-1/2 md:hidden">
      <nav className="relative flex items-center justify-around rounded-2xl border border-white/20 bg-background/80 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/plans" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1.5 py-2 transition-colors duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  className={cn(
                    "size-[22px] transition-transform duration-300",
                    isActive ? "scale-110" : "",
                  )}
                />
                <span className="text-[10px] font-bold tracking-tight uppercase">
                  {item.label}
                </span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 z-0 rounded-xl bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/20%)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1.5 py-2 transition-colors duration-300",
                isOpen
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <Menu
                  className={cn(
                    "size-[22px] transition-transform duration-300",
                    isOpen ? "scale-110" : "",
                  )}
                />
                <span className="text-[10px] font-bold tracking-tight uppercase">
                  More
                </span>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-[32px] border-t border-white/10 bg-background pb-12 pt-4 shadow-2xl backdrop-blur-3xl focus:outline-none focus-visible:outline-none"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/20" />
            <SheetHeader className="pb-6">
              <SheetTitle className="text-xl font-black tracking-tight">
                Account Options
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4">
              {/* User Profile Summary */}
              <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-4 border border-border/50">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle className="size-8" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-foreground line-clamp-1">
                    {user?.name || "Customer"}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {user?.email}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <MenuLink
                  href="/dashboard"
                  icon={Calendar}
                  label="Dashboard"
                  onClick={() => setIsOpen(false)}
                />
                <MenuLink
                  href="/profile"
                  icon={User}
                  label="Profile Settings"
                  onClick={() => setIsOpen(false)}
                />
                <MenuLink
                  href="/add-ons"
                  icon={PlusCircle}
                  label="Manage Add-ons"
                  onClick={() => setIsOpen(false)}
                />
                <MenuLink
                  href="/settings"
                  icon={Settings}
                  label="App Preferences"
                  onClick={() => setIsOpen(false)}
                />
              </div>

              <hr className="my-2 border-border/50" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center justify-between rounded-xl bg-red-500/5 p-4 text-red-500 transition-colors hover:bg-red-500/10"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="size-5" />
                  <span className="font-bold">
                    {logoutMutation.isPending ? "Signing out..." : "Log out"}
                  </span>
                </div>
                <ChevronRight className="size-4 opacity-50" />
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl bg-accent/30 p-4 transition-all hover:bg-accent/50 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-primary" />
        <span className="font-semibold text-foreground">{label}</span>
      </div>
      <ChevronRight className="size-4 text-muted-foreground opacity-50" />
    </Link>
  );
}
