"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { format } from "date-fns";
import type { CorporateOrderStatus, CorporatePaymentStatus } from "@/api/types/corporate.types";

const statusVariant: Record<CorporateOrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  draft: "secondary",
  pending_payment: "outline",
  completed: "secondary",
  cancelled: "destructive",
};

const statusLabel: Record<CorporateOrderStatus, string> = {
  active: "Active",
  draft: "Draft",
  pending_payment: "Pending Payment",
  completed: "Completed",
  cancelled: "Cancelled",
};

const paymentStatusLabel: Record<CorporatePaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
};

const paymentStatusVariant: Record<CorporatePaymentStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  paid: "default",
  overdue: "destructive",
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
      <div className="p-6 pt-7">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold/80 shadow-md shadow-gold/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
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
    (o) => o.payment_status === "pending" || o.payment_status === "overdue"
  );

  // Find the next upcoming delivery date from active orders
  const upcomingDelivery = activeOrders
    .filter((o) => new Date(o.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2 rounded-xl" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[400px]">
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
          size="lg"
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold/80">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-gold">
              Corporate
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">
              {user?.name || "Corporate"}
            </span>
          </p>
        </div>

        <Button
          onClick={() => router.push("/corporate/create-order")}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98]"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Active Orders"
          value={activeOrders.length}
          subtitle={`${activeOrders.length === 1 ? "order" : "orders"} in progress`}
          icon={ClipboardList}
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices.length}
          subtitle="awaiting payment"
          icon={FileText}
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

      {/* Recent Orders */}
      {ordersList.length === 0 ? (
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
          <div className="flex flex-col items-center justify-center py-24 px-6">
            <div className="p-5 rounded-2xl bg-muted/50 mb-6 text-muted-foreground">
              <ClipboardList className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
              Create your first bulk order to get started with corporate meal
              delivery.
            </p>
            <Button
              onClick={() => router.push("/corporate/create-order")}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20"
            >
              <PlusCircle className="h-5 w-5" />
              Create Your First Order
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-primary" />
          <div className="p-6 pt-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {ordersList.length} total{" "}
                  {ordersList.length === 1 ? "order" : "orders"}
                </p>
              </div>
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
                {ordersList.map((order) => (
                  <TableRow
                    key={order._id}
                    className="cursor-pointer group"
                    onClick={() => router.push(`/corporate/orders/${order._id}`)}
                  >
                    <TableCell className="font-semibold">
                      {order.order_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(order.start_date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(order.end_date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status]}>
                        {statusLabel[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant[order.payment_status]}>
                        {paymentStatusLabel[order.payment_status]}
                      </Badge>
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
