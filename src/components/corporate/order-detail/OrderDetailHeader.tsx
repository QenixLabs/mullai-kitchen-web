"use client";

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
        "flex items-center justify-end border-gray-200 px-4 py-8 gap-4",
        className
      )}
    >
      {/* Right side - Avatar and Create New Order Button */}
     

      <Button
        onClick={() => router.push("/corporate/create-order")}
        className="h-10 px-6 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        Create New Order
      </Button>
       <div className="h-10 w-10 overflow-hidden rounded-full border border-border shadow-sm">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user?.name ?? "Profile"}
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
