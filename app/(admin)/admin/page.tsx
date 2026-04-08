"use client";

import { Can } from "@/components/Auth/can";
import { KPICard } from "@/components/admin/dashboard/KPICard";
import { QuickActionsPanel } from "@/components/admin/dashboard/QuickActionsPanel";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import {
  TrendingUp,
  ClipboardList,
  BarChart3,
  Users,
  Store,
  UtensilsCrossed,
  Route,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Loading..." loading />
        <KPICard label="Loading..." loading />
        <KPICard label="Loading..." loading />
        <KPICard label="Loading..." loading />
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
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Subscriptions */}
        <Can permission="subscription:view:any">
          <KPICard
            label="Active Subscriptions"
            value={data?.subscriptions?.active}
            trend={data?.subscriptions?.trend}
            icon={TrendingUp}
          />
        </Can>

        {/* Today&apos;s Orders */}
        <Can permission={["order:view:any", "order:view:outlet"]} requireAll={false}>
          <KPICard
            label="Today's Orders"
            value={data?.orders?.today}
            trend={data?.orders?.trend}
            icon={ClipboardList}
          />
        </Can>

        {/* Monthly Revenue */}
        <Can permission="report:financial">
          <KPICard
            label="Monthly Revenue"
            value={data?.revenue?.month}
            formatValue={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
            trend={data?.revenue?.trend}
            icon={BarChart3}
          />
        </Can>

        {/* Active Users */}
        <Can permission="user:view:any">
          <KPICard
            label="Active Users"
            value={data?.users?.total}
            trend={data?.users?.trend}
            icon={Users}
          />
        </Can>

        {/* Active Outlets */}
        <Can permission="outlet:view:any">
          <KPICard
            label="Active Outlets"
            value={data?.outlets?.active}
            trend={data?.outlets?.trend}
            icon={Store}
          />
        </Can>

        {/* Kitchen Status */}
        <Can permission="order:kitchen">
          <KPICard
            label="Kitchen Status"
            value={data?.kitchen?.mealsToday ?? 0}
            trend={data?.kitchen?.trend}
            icon={UtensilsCrossed}
          />
        </Can>

        {/* Routes Progress */}
        <Can permission="route:assign">
          <KPICard
            label="Routes Progress"
            value={data?.routes?.active ?? 0}
            trend={data?.routes?.trend}
            icon={Route}
          />
        </Can>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <QuickActionsPanel />
      </div>

      {/* System Alerts - Super Admin only */}
      <Can permission="config:system">
        <div className="rounded-lg border bg-card">
          <div className="p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              System Alerts
            </h3>
            <div className="mt-3">
              {data?.alerts && data.alerts.length > 0 ? (
                <div className="space-y-3">
                  {data.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                    >
                      <span
                        className={`text-xs font-medium ${
                          alert.type === "error"
                            ? "text-red-500"
                            : alert.type === "warning"
                            ? "text-yellow-500"
                            : "text-blue-500"
                        }`}
                      >
                        {alert.type}
                      </span>
                      <span className="flex-1 text-sm">{alert.message}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No alerts at this time
                </p>
              )}
            </div>
          </div>
        </div>
      </Can>
    </div>
  );
}
