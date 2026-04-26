"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCalendarWeek, FaUser } from "react-icons/fa";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/delivery", icon: FaCalendarWeek, label: "Today", exact: true },
  { href: "/delivery/profile", icon: FaUser, label: "Profile", exact: false },
] as const;

interface DeliveryBottomNavProps {
  className?: string;
}

export const DELIVERY_BOTTOM_NAV_HEIGHT_CLASS = "pb-24";

export function DeliveryBottomNav({ className }: DeliveryBottomNavProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-50 w-full max-w-[92%] -translate-x-1/2 md:max-w-[28rem]",
        className,
      )}
    >
      <nav className="relative flex items-center justify-around rounded-2xl border border-white/20 bg-background/80 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href ||
              (pathname.startsWith("/delivery/routes") && item.href === "/delivery")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                  layoutId="delivery-bottom-nav-indicator"
                  className="absolute inset-0 z-0 rounded-xl bg-primary/5 shadow-[0_0_20px_-5px_hsl(var(--primary)/20%)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
