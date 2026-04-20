"use client";

import Image from "next/image";
import { Bell, Menu } from "lucide-react";

import { useCurrentUser } from "@/hooks/useUserStore";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function AdminHeader({ className, onMenuClick }: AdminHeaderProps) {
  const user = useCurrentUser();

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
        "fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-md lg:left-64 lg:px-8 lg:py-4",
        className
      )}
      style={{
        backgroundColor: "rgba(230,230,230,0.85)",
        boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.05)",
      }}
    >
      {/* Left side - Mobile toggle + Role title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5 lg:hidden"
        >
          <Menu className="h-5 w-5" style={{ color: "#44151c" }} />
        </button>
        <h1
          className="text-sm font-bold lg:text-xl"
          style={{
            fontFamily: "Manrope, sans-serif",
            color: "#3d000c",
          }}
        >
          SUPER ADMIN
        </h1>
      </div>

      {/* Right side - Notification and avatar */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button className="relative flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-black/5">
          <Bell className="h-5 w-5 lg:h-[22px] lg:w-[22px]" style={{ color: "#44151c" }} />
          {/* Notification dot */}
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div
          className="flex items-center justify-center overflow-hidden rounded-full border-2 p-0.5"
          style={{ borderColor: "rgba(61,0,12,0.1)" }}
        >
          <div
            className="relative h-8 w-8 overflow-hidden rounded-full border lg:h-9 lg:w-9"
            style={{ borderColor: "#44151c" }}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={user?.name ?? "Profile"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
