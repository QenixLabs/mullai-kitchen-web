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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="container mx-auto p-6 ">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-sm" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6  flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive mb-6">
          <LayoutDashboard className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground mb-8 text-center">
          {error instanceof Error
            ? error.message
            : "Failed to load dashboard data. Please try again."}
        </p>
        <Button size="lg" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 ">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-sm bg-primary/10 text-primary">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-primary/80">
              Corporate
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3">
            Corporate Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.name || "Corporate"}</span>
          </p>
        </div>

        <Button
          onClick={() => router.push("/corporate/create-order")}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeOrders.length === 1 ? "order" : "orders"} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invoices
            </CardTitle>
            <FileText className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Delivery
            </CardTitle>
            <Truck className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            {upcomingDelivery ? (
              <>
                <div className="text-3xl font-bold">
                  {format(new Date(upcomingDelivery.start_date), "MMM dd")}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {upcomingDelivery.order_id}
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-muted-foreground">--</div>
                <p className="text-xs text-muted-foreground mt-1">
                  No upcoming deliveries
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent -z-10 h-64 pointer-events-none" />

        {ordersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-gray-200 rounded-sm bg-gray-50/50">
            <div className="p-5 rounded-full bg-white shadow-sm mb-6 text-gray-400">
              <ClipboardList className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-8 text-center ">
              No orders yet. Create your first bulk order to get started with
              corporate meal delivery.
            </p>
            <Button
              onClick={() => router.push("/corporate/create-order")}
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
            >
              <PlusCircle className="h-5 w-5" />
              Create Your First Order
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Orders</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {ordersList.length} total {ordersList.length === 1 ? "order" : "orders"}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                      className="cursor-pointer"
                      onClick={() => router.push(`/corporate/orders/${order._id}`)}
                    >
                      <TableCell className="font-medium">{order.order_id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(order.start_date), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {order.final_amount.toLocaleString("en-IN")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
