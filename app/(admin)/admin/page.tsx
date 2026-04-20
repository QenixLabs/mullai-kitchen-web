"use client";

import { Can } from "@/components/Auth/can";
import { AdminPageHeader } from "@/components/admin/layout/AdminPageHeader";
import { BentoStatsCard } from "@/components/admin/layout/BentoStatsCard";
import { QuickActionsPanel } from "@/components/admin/dashboard/QuickActionsPanel";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ClipboardList,
  BarChart3,
  Users,
  AlertTriangle,
  Download,
  Settings,
} from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-10 w-full max-w-[384px]" />
            <Skeleton className="h-6 w-full max-w-[320px]" />
          </div>
          <div className="flex w-full flex-wrap shrink-0 items-center gap-3 sm:w-auto">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <p>Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="OPERATIONAL OVERSIGHT"
        subtitle="Global kitchen performance and logistics orchestration."
      >
        <Button
          variant="outline"
          className="rounded-full border-[rgba(219,192,193,0.4)] bg-white px-5 py-2 text-sm font-semibold text-[#44151c] hover:bg-[#44151c]/5"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
        <Button
          className="rounded-full bg-gradient-to-r from-[#3d000c] to-[#5d101d] px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure Outlets
        </Button>
      </AdminPageHeader>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Can permission="subscription:view:any">
          <BentoStatsCard
            label="TOTAL ACTIVE SUBSCRIPTIONS"
            value={data?.subscriptions?.active?.toLocaleString() ?? "—"}
            icon={TrendingUp}
          />
        </Can>

        <Can permission={["order:view:any", "order:view:outlet"]} requireAll={false}>
          <BentoStatsCard
            label="TODAY'S ORDERS"
            value={data?.orders?.today?.toLocaleString() ?? "—"}
            icon={ClipboardList}
          />
        </Can>

        <Can permission="report:financial">
          <BentoStatsCard
            label="MONTHLY REVENUE"
            value={`₹${data?.revenue?.month?.toLocaleString() ?? "—"}`}
            icon={BarChart3}
          />
        </Can>

        <Can permission="user:view:any">
          <BentoStatsCard
            label="ACTIVE USERS"
            value={data?.users?.total?.toLocaleString() ?? "—"}
            icon={Users}
          />
        </Can>
      </div>

      {/* Bottom Section: Outlet Performance + Quick Actions / System Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Outlet Performance */}
        <div className="rounded-2xl border border-[rgba(219,192,193,0.2)] bg-white p-6">
          <h2
            className="mb-5 text-lg font-bold"
            style={{ color: "#44151c", lineHeight: "24px" }}
          >
            Outlet Performance
          </h2>
          <div className="space-y-4">
            {/* Downtown Central Kitchen */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#44151c]">
                  Downtown Central Kitchen
                </p>
                <p className="text-xs font-medium text-[#554243]">452 Orders</p>
              </div>
              <span
                className="self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto"
                style={{
                  backgroundColor: "rgba(0,153,15,0.22)",
                  color: "#00990f",
                }}
              >
                ACTIVE
              </span>
            </div>
            {/* Brooklyn East Hub */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#44151c]">
                  Brooklyn East Hub
                </p>
                <p className="text-xs font-medium text-[#554243]">0 Orders</p>
              </div>
              <span
                className="self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto"
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#d97706",
                }}
              >
                PENDING
              </span>
            </div>
            {/* Queens Industrial Point */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#44151c]">
                  Queens Industrial Point
                </p>
                <p className="text-xs font-medium text-[#554243]">
                  Critical Failure
                </p>
              </div>
              <span
                className="self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto"
                style={{
                  backgroundColor: "rgba(255,0,4,0.17)",
                  color: "#ff0004",
                }}
              >
                ERROR
              </span>
            </div>
            {/* Jersey Shore Annex */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#44151c]">
                  Jersey Shore Annex
                </p>
                <p className="text-xs font-medium text-[#554243]">112 Orders</p>
              </div>
              <span
                className="self-start rounded-full px-3 py-1 text-xs font-bold sm:self-auto"
                style={{
                  backgroundColor: "rgba(0,153,15,0.22)",
                  color: "#00990f",
                }}
              >
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions + System Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-[rgba(219,192,193,0.2)] bg-white p-6">
            <h2
              className="mb-5 text-lg font-bold"
              style={{ color: "#44151c", lineHeight: "24px" }}
            >
              Quick Actions
            </h2>
            <QuickActionsPanel />
          </div>

          {/* System Alerts - Super Admin only */}
          <Can permission="config:system">
            <div className="rounded-2xl border border-[rgba(219,192,193,0.2)] bg-white p-6">
              <h2
                className="mb-5 flex items-center gap-2 text-lg font-bold"
                style={{ color: "#44151c", lineHeight: "24px" }}
              >
                <AlertTriangle className="h-5 w-5 text-[#d97706]" />
                System Alerts
              </h2>
              <div className="space-y-3">
                {data?.alerts && data.alerts.length > 0 ? (
                  data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex flex-col items-start gap-2 rounded-2xl p-4 sm:flex-row sm:items-start sm:gap-3 ${
                        alert.type === "error"
                          ? "bg-[rgba(255,0,4,0.08)]"
                          : alert.type === "warning"
                          ? "bg-[rgba(217,119,6,0.08)]"
                          : "bg-[rgba(59,130,246,0.08)]"
                      }`}
                    >
                      <span
                        className="shrink-0 text-xs font-bold uppercase sm:mt-0.5"
                        style={{
                          color:
                            alert.type === "error"
                              ? "#ff0004"
                              : alert.type === "warning"
                              ? "#d97706"
                              : "#3b82f6",
                        }}
                      >
                        {alert.type}
                      </span>
                      <span className="flex-1 text-sm font-medium text-[#44151c]">
                        {alert.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Hard-coded Figma alerts for design match */}
                    <div className="flex flex-col items-start gap-2 rounded-2xl bg-[rgba(255,0,4,0.08)] p-4 sm:flex-row sm:items-start sm:gap-3">
                      <span className="shrink-0 text-xs font-bold uppercase text-[#ff0004] sm:mt-0.5">
                        Error
                      </span>
                      <span className="flex-1 text-sm font-medium text-[#44151c]">
                        Failed Payments
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-2 rounded-2xl bg-[rgba(217,119,6,0.08)] p-4 sm:flex-row sm:items-start sm:gap-3">
                      <span className="shrink-0 text-xs font-bold uppercase text-[#d97706] sm:mt-0.5">
                        Warning
                      </span>
                      <span className="flex-1 text-sm font-medium text-[#44151c]">
                        System Issue: Latency
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Can>
        </div>
      </div>
    </div>
  );
}
