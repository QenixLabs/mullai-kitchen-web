"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Mail, Phone, RefreshCw } from "lucide-react";

import {
  useDeliveryProfile,
  useUpdateAvailability,
} from "@/api/hooks/useDeliveryRoutes";
import { useLogout } from "@/api/hooks/useAuth";
import {
  AvailabilityBadge,
  type AvailabilityStatus,
} from "@/components/delivery";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Delivery partner profile screen (DEL-014).
 *
 * Renders profile data from `useDeliveryProfile()` and exposes an
 * availability toggle wired to `useUpdateAvailability()`. The toggle is
 * disabled while the partner has an active route or the server-side
 * `'On Delivery'` status — the UI mirrors the server's invariants so the
 * toggle never sends `'On Delivery'` upstream.
 */
export default function DeliveryProfilePage() {
  const profileQuery = useDeliveryProfile();
  const updateAvailability = useUpdateAvailability();
  const logoutMutation = useLogout();
  const router = useRouter();

  // Track local switch state for instant feedback. We seed it from the
  // server response and resync if the underlying profile changes (e.g.
  // refetch after success / error).
  const serverStatus = profileQuery.data?.availability_status ?? "";
  const serverIsAvailable = serverStatus === "Available";
  const [localIsAvailable, setLocalIsAvailable] =
    useState<boolean>(serverIsAvailable);

  useEffect(() => {
    setLocalIsAvailable(serverIsAvailable);
  }, [serverIsAvailable]);

  // Redirect to signin once logout settles. `useLogout` clears the session
  // and TanStack cache in `onSettled` regardless of network outcome.
  useEffect(() => {
    if (logoutMutation.isSuccess || logoutMutation.isError) {
      router.replace("/auth/signin");
    }
  }, [logoutMutation.isSuccess, logoutMutation.isError, router]);

  // ---- Loading ----------------------------------------------------------
  if (profileQuery.isPending) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Profile
        </h1>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // ---- Error ------------------------------------------------------------
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="flex flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Profile
        </h1>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-destructive">
            Failed to load profile
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => profileQuery.refetch()}
            disabled={profileQuery.isFetching}
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;

  // Normalise empty-string availability (uninitialised partners) to
  // 'Inactive' for the badge — the server treats them equivalently.
  const badgeStatus: AvailabilityStatus =
    profile.availability_status === "Available" ||
    profile.availability_status === "On Delivery" ||
    profile.availability_status === "Inactive"
      ? profile.availability_status
      : "Inactive";

  const hasActiveRoute = Boolean(profile.current_route_id);
  const isOnDelivery = profile.availability_status === "On Delivery";
  const toggleDisabled =
    hasActiveRoute || isOnDelivery || updateAvailability.isPending;

  const helperText = hasActiveRoute
    ? "Complete your active route first."
    : isOnDelivery
      ? "You are currently out for delivery."
      : null;

  const outletDisplay =
    profile.assigned_outlet_name ?? profile.assigned_outlet_id;

  const showVehicle = Boolean(profile.vehicle_type && profile.vehicle_number);

  const handleToggleChange = (next: boolean) => {
    if (toggleDisabled) return;
    // Optimistic local flip; on error we revert and the server profile
    // refetch will re-sync via the `useEffect` above.
    const previous = localIsAvailable;
    setLocalIsAvailable(next);
    updateAvailability.mutate(
      { status: next ? "Available" : "Inactive" },
      {
        onError: () => {
          setLocalIsAvailable(previous);
        },
      },
    );
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 px-4 py-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Profile
        </h1>

        {/* Profile card */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Delivery Partner
            </span>
            <h2 className="text-xl font-bold text-foreground">
              {profile.name}
            </h2>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            {profile.phone ? (
              <a
                href={`tel:${profile.phone}`}
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary"
              >
                <Phone className="size-4 text-muted-foreground" />
                <span className="font-medium">{profile.phone}</span>
              </a>
            ) : null}

            {profile.email ? (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Mail className="size-4 text-muted-foreground" />
                <span className="break-all">{profile.email}</span>
              </div>
            ) : null}

            <div className="flex flex-col gap-0.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Outlet
              </span>
              <span className="text-sm font-medium text-foreground">
                {outletDisplay}
              </span>
            </div>

            {showVehicle ? (
              <div className="flex flex-col gap-0.5 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Vehicle
                </span>
                <span className="text-sm font-medium text-foreground">
                  {profile.vehicle_type}
                  <span className="mx-1.5 text-muted-foreground">&bull;</span>
                  {profile.vehicle_number}
                </span>
              </div>
            ) : null}
          </div>
        </section>

        {/* Availability section */}
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-foreground">
              Availability
            </h2>
            <p className="text-xs text-muted-foreground">
              Set yourself Available to receive new route assignments. Inactive
              partners are not assigned to routes.
            </p>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Current status
              </span>
              <AvailabilityBadge status={badgeStatus} />
            </div>

            <div className="flex items-center gap-2">
              {updateAvailability.isPending ? (
                <Loader2
                  className="size-4 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
              {toggleDisabled && helperText ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Switch
                        checked={localIsAvailable}
                        onCheckedChange={handleToggleChange}
                        disabled={toggleDisabled}
                        aria-label="Toggle availability"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{helperText}</TooltipContent>
                </Tooltip>
              ) : (
                <Switch
                  checked={localIsAvailable}
                  onCheckedChange={handleToggleChange}
                  disabled={toggleDisabled}
                  aria-label="Toggle availability"
                />
              )}
            </div>
          </div>

          {helperText ? (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          ) : null}
        </section>

        {/* Logout */}
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="mt-2 w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
        >
          <LogOut className="size-4" />
          {logoutMutation.isPending ? "Signing out..." : "Log out"}
        </Button>
      </div>
    </TooltipProvider>
  );
}
