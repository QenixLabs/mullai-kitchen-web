"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Truck,
  PlusCircle,
  ArrowRight,
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCorporateOrders } from "@/api/hooks/useCorporate";
import { useCurrentUser } from "@/hooks/useUserStore";
import { OrderStatusBadge } from "@/components/corporate/OrderStatusBadge";
import { PaymentStatusBadge } from "@/components/corporate/PaymentStatusBadge";
import { CorporatePageHeader } from "@/components/corporate/CorporatePageHeader";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrder } from "@/api/types/corporate.types";

const DAY_ABBREVIATIONS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-200 ${
        href ? "cursor-pointer hover:shadow-md" : ""
      }`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          {href && (
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-black tracking-tight mt-0.5">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function CompactOrderCard({ order }: { order: ICorporateOrder }) {
  const elapsed = Math.max(
    0,
    differenceInDays(new Date(), parseISO(order.start_date)),
  );
  const progress = Math.min(
    100,
    (elapsed / (order.total_delivery_days || 1)) * 100,
  );

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-1 flex-col p-5">
        {/* Order ID and Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link
            href={`/corporate/orders/${order._id}`}
            className="text-lg font-bold text-foreground hover:text-primary transition-colors"
          >
            {order.order_id}
          </Link>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Schedule: Days and Meal Types */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {order.selected_days.map((day) => (
            <span
              key={day}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {DAY_ABBREVIATIONS[day.toLowerCase()] || day.slice(0, 3)}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {order.meal_types.length} meal{order.meal_types.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>
            {formatDate(order.start_date)} - {formatDate(order.end_date)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Day {elapsed} of {order.total_delivery_days}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1.5 font-bold text-foreground mb-4">
          <IndianRupee className="h-4 w-4" />
          <span>{order.final_amount.toLocaleString("en-IN")}</span>
        </div>

        {/* Quick Actions */}
        <div className="mt-auto flex gap-2">
          <Link href={`/corporate/orders/${order._id}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-full text-sm"
            >
              View
            </Button>
          </Link>
          <Link
            href={`/corporate/orders/${order._id}?tab=schedule`}
            className="flex-1"
          >
            <Button
              size="sm"
              className="w-full rounded-full text-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Modify
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CorporateDashboardPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data: orders, isLoading, error } = useCorporateOrders();

  const ordersList = orders ?? [];

  const activeOrders = ordersList.filter((o) => o.status === "active");
  const pendingInvoices = ordersList.filter(
    (o) => o.payment_status === "pending" || o.payment_status === "overdue",
  );

  const upcomingDelivery = activeOrders
    .filter((o) => new Date(o.start_date) > new Date())
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    )[0];

  const recentOrders = [...ordersList]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5);

  const spotlightOrders = activeOrders.slice(0, 3);
  const hasMoreActiveOrders = activeOrders.length > 3;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2 rounded-2xl" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <LayoutDashboard className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-8 text-center">
          {error instanceof Error
            ? error.message
            : "Failed to load dashboard data. Please try again."}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <CorporatePageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || "Corporate"}`}
        action={{
          label: "Create New Order",
          onClick: () => router.push("/corporate/create-order"),
          icon: PlusCircle,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Active Orders"
          value={activeOrders.length}
          subtitle={`${activeOrders.length === 1 ? "order" : "orders"} in progress`}
          icon={ClipboardList}
          href="/corporate/orders?status=active"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          subtitle="awaiting payment"
          icon={FileText}
          href="/corporate/orders?payment=pending,overdue"
        />
        <StatCard
          title="Upcoming Delivery"
          value={
            upcomingDelivery
              ? format(new Date(upcomingDelivery.start_date), "MMM dd")
              : "--"
          }
          subtitle={
            upcomingDelivery
              ? upcomingDelivery.order_id
              : "No upcoming deliveries"
          }
          icon={Truck}
        />
      </div>

      {/* Active Orders Spotlight */}
      {spotlightOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Active Orders
            </h2>
            {hasMoreActiveOrders && (
              <Link
                href="/corporate/orders?status=active"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {spotlightOrders.map((order) => (
              <CompactOrderCard key={order._id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders / Empty State */}
      {ordersList.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center rounded-2xl bg-card border border-border shadow-sm py-24 px-6">
          <div className="p-5 rounded-full bg-muted mb-6 text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Create your first bulk order to get started with corporate meal
            delivery.
          </p>
          <Button
            onClick={() => router.push("/corporate/create-order")}
            className="gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            Create Your First Order
          </Button>
        </div>
      ) : (
        <div className="relative rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Recent Orders
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {ordersList.length} total{" "}
                  {ordersList.length === 1 ? "order" : "orders"}
                </p>
              </div>
              <Link
                href="/corporate/orders"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="cursor-pointer group"
                    onClick={() =>
                      router.push(`/corporate/orders/${order._id}`)
                    }
                  >
                    <TableCell className="font-semibold">
                      {order.order_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(order.start_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(order.end_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.payment_status} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <div className="flex items-center justify-end gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {order.final_amount.toLocaleString("en-IN")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
