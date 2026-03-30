"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  ArrowRight,
  Utensils,
  Calendar,
  Gem,
  IndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { ICorporateOrder } from "@/api/types/corporate.types";
import { cn } from "@/lib/utils";

function LiveOperationsCard({ count }: { count: number }) {
  return (
    <Link href="/corporate/orders?status=active">
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-3xl bg-white border border-border/40 p-6 h-full cursor-pointer group"
      >
        {/* Fork/Knife Icon - top right */}
        <div className="absolute top-4 right-4 text-muted/20">
          <Utensils className="w-12 h-12" strokeWidth={1.5} />
        </div>

        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Live Operations
          </p>

          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl font-bold text-primary tracking-tight">
              {String(count).padStart(2, '0')}
            </span>
            {count > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-[9px] bg-emerald-500 text-white text-xs font-semibold">
                Active
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground font-medium">
            Orders in fulfillment
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

function FinancialPendingsCard({ count }: { count: number }) {
  // Calculate total pending amount (mock calculation based on orders)
  const pendingAmount = count * 12551.4; // Mock calculation

  return (
    <Link href="/corporate/orders?payment=pending,overdue">
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-3xl p-6 h-full cursor-pointer group border border-black"
        style={{ backgroundColor: '#F2ECED' }}
      >
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Financial Pendings
          </p>

          <div className="flex items-baseline gap-0.5 mb-3">
            <span className="text-4xl font-bold text-primary tracking-tight">
              ₹{pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            Unsettled Cycle Records
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

function NextAllocationCard({ order }: { order?: ICorporateOrder }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-3xl p-6 h-full"
      style={{ backgroundColor: '#3A070F' }}
    >
      {/* Calendar watermark */}
      <div className="absolute bottom-0 right-0 opacity-10">
        <Calendar className="w-32 h-32 text-white" strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-4">
          Next Allocation
        </p>

        {order ? (
          <>
            <p className="text-3xl font-semibold text-white tracking-tight mb-2">
              {format(new Date(order.start_date), "MMM dd, yyyy")}
            </p>
            <p className="text-sm text-white/80 font-medium">
              Order {order.order_id}
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold text-white tracking-tight mb-2">
              --
            </p>
            <p className="text-sm text-white/80 font-medium">
              No upcoming cycles
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CompactOrderCard({ order }: { order: ICorporateOrder }) {
  const elapsed = Math.max(
    0,
    differenceInDays(new Date(), parseISO(order.start_date)),
  );
  const total = order.total_delivery_days || 1;
  const isActive = order.status === "active";

  // Format meal types
  const mealMixText = (order.meal_types || []).map(m =>
    m.charAt(0).toUpperCase() + m.slice(1)
  ).join(' & ') || 'N/A';

  // Format delivery address
  type DeliveryAddress = {
    area?: string;
    city?: string;
    address_line?: string;
  };

  const formatAddress = (address: unknown): string => {
    if (!address) return 'Not specified';
    if (typeof address === 'string') return address;
    if (typeof address !== 'object') return 'Not specified';

    const safeAddress = address as DeliveryAddress;

    try {
      const parts = [
        safeAddress.area,
        safeAddress.city
      ].filter((part): part is string => Boolean(part) && typeof part === 'string');

      if (parts.length > 0) {
        return parts.join(', ');
      }

      return safeAddress.address_line || 'Not specified';
    } catch {
      return 'Not specified';
    }
  };

  const locationText = formatAddress(order.delivery_address);

  return (
    <Link href={`/corporate/orders/${order._id}`}>
      <motion.div
        layout
        whileHover={{ y: -4 }}
        className="group relative flex flex-col overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 h-full cursor-pointer"
      >
        <div className="flex flex-1 flex-col p-6">
          {/* Status Badges - Top */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2.5 h-2.5 rounded-full",
                isActive ? "bg-[#00990F]" : "bg-gray-300"
              )} />
              <span className={cn(
                "text-xs font-semibold tracking-wide",
                isActive ? "text-[#00990F]" : "text-gray-500"
              )}>
                ACTIVE
              </span>
            </div>
            {order.status === "pending_payment" && (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF962D]" />
                <span className="text-xs font-semibold tracking-wide text-[#FF962D]">
                  PENDING
                </span>
              </div>
            )}
          </div>

          {/* Order ID and Company Name */}
          <div className="mb-6">
            <p className="text-base font-semibold text-primary mb-1" style={{ fontFamily: "Inter, sans-serif" }}>{order.order_id}</p>
            <h3 className="text-base font-semibold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>
              {order.company_name}
            </h3>
          </div>

          {/* Info Grid - 2 columns */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
            {/* Headcount */}
            <div>
              <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">HEADCOUNT</p>
              <p className="text-base font-semibold text-[#554243]">{order.headcount} People</p>
            </div>

            {/* Meal Mix */}
            <div>
              <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">MEAL MIX</p>
              <p className="text-base font-semibold text-[#554243]">{mealMixText}</p>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">DURATION</p>
              <p className="text-base font-semibold text-[#554243] truncate">
                {order.selected_days.slice(0, 2).join(", ")}
                {order.selected_days.length > 2 && "..."}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">STATUS</p>
              <p className="text-base font-semibold text-[#554243]">
                {order.status === "active" ? "In Progress" :
                 order.status === "pending_payment" ? "Pending Payment" :
                 order.status === "completed" ? "Completed" : "Draft"}
              </p>
            </div>

            {/* Active Progress */}
            <div>
              <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">ACTIVE PROGRESS</p>
              <p className="text-base font-semibold text-[#554243]">{elapsed}/{total} Days</p>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs font-medium text-[#554243] uppercase tracking-wider mb-1">LOCATION</p>
              <p className="text-base font-semibold text-[#554243] truncate">{locationText}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Footer - Total and Arrow */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">TOTAL</p>
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <IndianRupee className="h-5 w-5" />
                <span>{order.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button className="h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <ArrowRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function CorporateDashboardPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data: orders, isLoading, error } = useCorporateOrders();
  const avatarUrl = user?.avatar_url ?? "";

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
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-10">
           <Skeleton className="h-12 w-1/3 rounded-3xl" />
           <Skeleton className="h-4 w-1/4 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-4xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:py-24 lg:px-8 flex flex-col items-center justify-center min-h-125">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 rounded-full bg-destructive/10 text-destructive mb-8 border border-destructive/20"
        >
          <LayoutDashboard className="h-16 w-16" />
        </motion.div>
        <h2 className="text-3xl font-black mb-4">Dashboard Offline</h2>
        <p className="text-muted-foreground mb-12 text-center max-w-md font-medium">
          {error instanceof Error
            ? error.message
            : "We encountered a temporary synchronization error. Your corporate data remains secure."}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-10 h-14 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          FORCE SYNCHRONIZE
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-150 h-150 bg-primary/5 rounded-full blur-[140px] -mr-80 -mt-40" />
        <div className="absolute bottom-0 left-0 w-150 h-150 bg-gold/5 rounded-full blur-[140px] -ml-80 -mb-40" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
        <div>
          <h1 className="text-[36px] font-extrabold text-primary uppercase tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>
            Command Center
          </h1>
          <p className="text-[16px] font-medium text-[#554243] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Strategic Overview & Real-time Culinary Logistics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/corporate/create-order")}
            className="h-11 px-6 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Create New Order
          </Button>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-border shadow-sm">
            {avatarUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={user?.name ?? "Profile"}
                  className="h-full w-full object-cover"
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
                {user?.name
                  ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                  : "U"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <LiveOperationsCard count={activeOrders.length} />
        <FinancialPendingsCard count={pendingInvoices.length} />
        <NextAllocationCard order={upcomingDelivery} />
      </div>

      {/* Active Orders Spotlight */}
      <AnimatePresence>
        {spotlightOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                ACTIVE SPOTLIGHT
              </h2>
              {hasMoreActiveOrders && (
                <Link
                  href="/corporate/orders"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  style={{ color: '#7A4B4E' }}
                >
                  View All Records
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {spotlightOrders.map((order) => (
                <CompactOrderCard key={order._id} order={order} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Orders Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-primary uppercase">
            Fulfillment History
          </h2>
          <Link
            href="/corporate/orders"
            className="text-sm font-medium hover:text-primary transition-colors"
            style={{ color: '#7A4B4E' }}
          >
            View Archive
          </Link>
        </div>

        {ordersList.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center rounded-4xl bg-secondary/10 border-2 border-dashed border-border/40 py-32 px-6">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_100%)] blur-3xl" />
            </div>
            <div className="p-8 rounded-4xl bg-primary/5 text-primary mb-8 relative">
              <ClipboardList className="h-16 w-16" />
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
                <Gem className="w-5 h-5 text-gold" />
              </div>
            </div>
            <h3 className="text-3xl font-black mb-4">Begin Your Journey</h3>
            <p className="text-muted-foreground mb-12 text-center max-w-md font-medium leading-relaxed">
              Ready to transform your employee dining experience? <br/> Initiate your first high-volume corporate cycle today.
            </p>
            <Button
              onClick={() => router.push("/corporate/create-order")}
              className="h-14 px-10 rounded-4xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
            >
              <PlusCircle className="mr-3 h-5 w-5" />
              NEW CYCLE REQUEST
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#F8F2F3' }}>
            <div className="overflow-x-auto" >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-0" style={{backgroundColor:'#FFFFFF'}}>
                    <TableHead className="py-4 px-6 text-sm font-semibold text-primary">Execution ID</TableHead>
                    <TableHead className="py-4 text-sm font-semibold text-primary">LifeCycle</TableHead>
                    <TableHead className="py-4 text-sm font-semibold text-primary text-center">Operation</TableHead>
                    <TableHead className="py-4 text-sm font-semibold text-primary text-center">Financials</TableHead>
                    <TableHead className="py-4 text-sm font-semibold text-primary text-right">Commitment</TableHead>
                    <TableHead className="py-4 px-6 w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="group cursor-pointer hover:bg-white/50 transition-colors border-0"
                      onClick={() => router.push(`/corporate/orders/${order._id}`)}
                    >
                      <TableCell className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-primary">
                            {order.order_id}
                          </span>
                          <span className="text-sm text-primary/70">
                            {order.company_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-primary">
                            {format(new Date(order.start_date), "MMM dd, yyyy")}
                          </span>
                          <span className="text-sm font-medium text-primary">
                            {format(new Date(order.end_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-[9px] bg-emerald-500 text-white text-sm font-semibold">
                            Active
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center px-4 py-1.5 rounded-[9px] bg-amber-500 text-white text-sm font-semibold">
                            Pending
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-right">
                        <span className="text-xl font-bold text-primary">
                          ₹{order.final_amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell className="py-5 px-6">
                        <div className="flex justify-end">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white transition-all">
                            <ArrowRight className="h-5 w-5 text-[#FBFBFB]" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
