"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  useAuthHydrated,
  useIsAuthenticated,
  useCurrentUser,
} from "@/hooks/useUserStore";
import { isDeliveryPartnerRole } from "@/api/types/user.types";
import { useDeliveryProfile } from "@/api/hooks/useDeliveryRoutes";
import {
  AvailabilityBadge,
  DeliveryBottomNav,
  DELIVERY_BOTTOM_NAV_HEIGHT_CLASS,
  type AvailabilityStatus,
} from "@/components/delivery";
import { cn } from "@/lib/utils";

interface DeliveryLayoutProps {
  children: ReactNode;
}

// TODO: DEL-011 will extend IUser in `src/api/types/user.types.ts` (or in a
// dedicated delivery-types file) with these delivery-partner fields. Until
// then, we read them defensively as optional unknown-keyed extensions.
interface DeliveryUserView {
  name?: string;
  assigned_outlet_name?: string;
  availability_status?: AvailabilityStatus;
}

function readDeliveryView(user: unknown): DeliveryUserView {
  if (!user || typeof user !== "object") return {};
  const u = user as Record<string, unknown>;
  return {
    name: typeof u.name === "string" ? u.name : undefined,
    assigned_outlet_name:
      typeof u.assigned_outlet_name === "string"
        ? u.assigned_outlet_name
        : undefined,
    availability_status:
      u.availability_status === "Available" ||
      u.availability_status === "On Delivery" ||
      u.availability_status === "Inactive"
        ? (u.availability_status as AvailabilityStatus)
        : undefined,
  };
}

export default function DeliveryLayout({ children }: DeliveryLayoutProps) {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const router = useRouter();

  const isDeliveryUser =
    hasHydrated && isAuthenticated && !!user?.role && isDeliveryPartnerRole(user.role);

  const liveProfileQuery = useDeliveryProfile({ enabled: isDeliveryUser });

  // Redirect non-authenticated users to sign in
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth/signin");
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Redirect non-delivery-partner users to home
  useEffect(() => {
    if (
      hasHydrated &&
      isAuthenticated &&
      user?.role &&
      !isDeliveryPartnerRole(user.role)
    ) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, user?.role, router]);

  // Loading state - hydration pending
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Preparing delivery session...
        </div>
      </div>
    );
  }

  // Redirect state - not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Redirecting to sign in...
        </div>
      </div>
    );
  }

  // Redirect state - not a delivery partner
  if (user?.role && !isDeliveryPartnerRole(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  const view = readDeliveryView(user);
  const liveProfile = liveProfileQuery.data;
  const liveStatus =
    liveProfile?.availability_status === "Available" ||
    liveProfile?.availability_status === "On Delivery" ||
    liveProfile?.availability_status === "Inactive"
      ? (liveProfile.availability_status as AvailabilityStatus)
      : undefined;
  const availabilityStatus: AvailabilityStatus =
    liveStatus ?? view.availability_status ?? "Inactive";
  const displayName = liveProfile?.name ?? view.name ?? "Partner";
  const outletName =
    liveProfile?.assigned_outlet_name ??
    view.assigned_outlet_name ??
    "Unassigned";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[28rem] flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Outlet
            </span>
            <span className="truncate text-sm font-bold text-foreground">
              {outletName}
            </span>
          </div>
          <div className="flex min-w-0 flex-col items-end gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </span>
            <AvailabilityBadge status={availabilityStatus} />
          </div>
        </div>
      </header>

      {/* Children with bottom padding so content doesn't sit under the nav */}
      <main className={cn("flex-1", DELIVERY_BOTTOM_NAV_HEIGHT_CLASS)}>
        {children}
      </main>

      {/* Bottom navigation */}
      <DeliveryBottomNav />
    </div>
  );
}
