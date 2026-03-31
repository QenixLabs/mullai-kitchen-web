"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useUserStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OrderDetailHeader({ className }: { className?: string }) {
  const router = useRouter();
  const user = useCurrentUser();

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-end gap-3 border-gray-200 px-4 py-5 sm:gap-4 sm:py-8",
        className
      )}
    >
      {/* Right side - Avatar and Create New Order Button */}
     

      <Button
        onClick={() => router.push("/corporate/create-order")}
        className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-6"
      >
        Create New Order
      </Button>
       <div className="h-10 w-10 overflow-hidden rounded-full border border-border shadow-sm">
        {user?.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user?.name ?? "Profile"}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
