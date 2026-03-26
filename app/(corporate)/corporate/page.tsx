"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
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
  ChevronRight,
  Target,
  Clock,
  Building2,
  Gem,
  ArrowUpRight
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
import { cn } from "@/lib/utils";

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
  color = "primary"
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  href?: string;
  color?: "primary" | "amber" | "emerald" | "rose";
}) {
  const CardContent = (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 transition-all p-7 h-full",
        href && "cursor-pointer group"
      )}
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
         <Icon className="w-24 h-24 -mr-8 -mt-8" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-black/5",
            color === "primary" && "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
            color === "amber" && "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
            color === "emerald" && "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
            color === "rose" && "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {href && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
               <ArrowUpRight className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{title}</p>
        <p className="text-4xl font-black tracking-tight">{value}</p>
        <div className="flex items-center gap-2 mt-2">
           <div className={cn("w-1 h-1 rounded-full", 
             color === "primary" ? "bg-primary" : 
             color === "amber" ? "bg-amber-500" : 
             color === "emerald" ? "bg-emerald-500" : "bg-rose-500"
           )} />
           <p className="text-xs font-bold text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );

  if (href) return <Link href={href}>{CardContent}</Link>;
  return CardContent;
}

function CompactOrderCard({ order }: { order: ICorporateOrder }) {
  const elapsed = Math.max(
    0,
    differenceInDays(new Date(), parseISO(order.start_date)),
  );
  const total = order.total_delivery_days || 1;
  const progress = Math.min(100, (elapsed / total) * 100);

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="group relative rounded-4xl bg-card border border-border/50 shadow-xl shadow-foreground/5 overflow-hidden flex flex-col transition-all"
    >
      {/* Visual Identity Strip */}
      <div className="h-2 bg-linear-to-r from-primary via-primary/80 to-gold/40 w-full" />
      
      <div className="p-7 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-6">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <Building2 className="w-3.5 h-3.5 text-primary/60" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 font-mono">{order.order_id}</span>
              </div>
              <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                 {order.company_name}
              </h3>
           </div>
           <OrderStatusBadge status={order.status} className="h-8 px-4 border-0 shadow-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="space-y-1.5 p-3 rounded-2xl bg-secondary/30 border border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                 <Target className="w-3 h-3" />
                 <span>Meal Mix</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                 {order.meal_types.length} Varieties
              </p>
           </div>
           <div className="space-y-1.5 p-3 rounded-2xl bg-secondary/30 border border-border/40">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                 <Clock className="w-3 h-3" />
                 <span>Timeline</span>
              </div>
              <p className="text-xs font-bold text-foreground">
                 {total} Days Cycle
              </p>
           </div>
        </div>

        {/* Dynamic Progress Section */}
        <div className="space-y-3 mb-8">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Delivery Progress</span>
              <span className="text-xs font-black font-mono text-primary">{Math.round(progress)}%</span>
           </div>
           <div className="h-2 w-full rounded-full bg-secondary/60 overflow-hidden relative border border-border/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-linear-to-r from-primary to-primary/80 rounded-full"
              />
           </div>
           <p className="text-[10px] font-bold text-muted-foreground">
              Day {elapsed} of {total} completed
           </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/40">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Final Value</span>
              <div className="flex items-baseline gap-0.5 text-lg font-black text-foreground font-mono">
                 <span className="text-xs">₹</span>
                 {order.final_amount.toLocaleString("en-IN")}
              </div>
           </div>
           
           <div className="flex gap-2">
              <Link href={`/corporate/orders/${order._id}`}>
                 <Button className="rounded-2xl h-11 px-6 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    Manage
                 </Button>
              </Link>
           </div>
        </div>
      </div>
    </motion.div>
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
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:py-24 lg:px-8 flex flex-col items-center justify-center min-h-[500px]">
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -mr-80 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -ml-80 -mb-40" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
         <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-br from-primary to-primary/80 text-white shadow-2xl shadow-primary/20">
               <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
               <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2">
                  Command Center
               </h1>
               <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/10 text-[10px] font-black uppercase tracking-widest">
                     Mullai Corporate
                  </Badge>
                  <p className="text-sm font-bold text-muted-foreground">Welcome back, {user?.name || "Corporate Partner"}</p>
               </div>
            </div>
         </div>
         
         <Button
            onClick={() => router.push("/corporate/create-order")}
            className="group relative h-14 px-8 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 overflow-hidden transition-all hover:scale-105 active:scale-95"
         >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <PlusCircle className="mr-3 h-5 w-5 relative z-10" />
            <span className="relative z-10">Initiate New Cycle</span>
         </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard
          title="Live Operations"
          value={activeOrders.length}
          subtitle="Orders in fulfillment"
          icon={ClipboardList}
          href="/corporate/orders?status=active"
          color="primary"
        />
        <StatCard
          title="Financial Pendings"
          value={pendingInvoices.length}
          subtitle="Unsettled Cycle Records"
          icon={FileText}
          href="/corporate/orders?payment=pending,overdue"
          color="amber"
        />
        <StatCard
          title="Next Allocation"
          value={
            upcomingDelivery
              ? format(new Date(upcomingDelivery.start_date), "MMM dd")
              : "--"
          }
          subtitle={
            upcomingDelivery
              ? `Order ${upcomingDelivery.order_id}`
              : "No upcoming cycles"
          }
          icon={Truck}
          color="emerald"
        />
      </div>

      {/* Active Orders Spotlight */}
      <AnimatePresence>
        {spotlightOrders.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                 <h2 className="text-3xl font-black tracking-tight">Active Spotlight</h2>
              </div>
              {hasMoreActiveOrders && (
                <Link
                  href="/corporate/orders"
                  className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                >
                  Explore All Operations
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black tracking-tight">Fulfillment History</h2>
            <Link
               href="/corporate/orders"
               className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
            >
               View Archive
               <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                  className="h-14 px-10 rounded-[2rem] bg-primary text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
               >
                  <PlusCircle className="mr-3 h-5 w-5" />
                  NEW CYCLE REQUEST
               </Button>
            </div>
         ) : (
            <div className="rounded-4xl bg-card border border-border/50 shadow-2xl shadow-foreground/5 overflow-hidden">
               <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                     <TableRow className="hover:bg-transparent border-b border-border/40 bg-secondary/30">
                        <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Execution ID</TableHead>
                        <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Lifecycle</TableHead>
                        <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Operation</TableHead>
                        <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-center">Financials</TableHead>
                        <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Commitment</TableHead>
                        <TableHead className="py-6 px-8 w-[80px]"></TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {recentOrders.map((order) => (
                        <TableRow
                           key={order._id}
                           className="group cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/20"
                           onClick={() => router.push(`/corporate/orders/${order._id}`)}
                        >
                           <TableCell className="py-7 px-8">
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                                    {order.order_id}
                                 </span>
                                 <span className="text-[10px] font-bold text-muted-foreground/60 truncate max-w-[150px]">
                                    {order.company_name}
                                 </span>
                              </div>
                           </TableCell>
                           <TableCell className="py-7">
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5 opacity-50" />
                                    {formatDate(order.start_date)}
                                 </div>
                                 <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                                    {formatDate(order.end_date)}
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell className="py-7">
                              <div className="flex justify-center">
                                 <OrderStatusBadge status={order.status} className="h-8 px-4 border-0 shadow-sm" />
                              </div>
                           </TableCell>
                           <TableCell className="py-7">
                              <div className="flex justify-center">
                                 <PaymentStatusBadge status={order.payment_status} className="h-8 px-4 border-0 shadow-sm" />
                              </div>
                           </TableCell>
                           <TableCell className="py-7 text-right">
                              <div className="flex flex-col items-end">
                                 <div className="flex items-baseline gap-0.5 text-sm font-black font-mono">
                                    <span className="text-[10px] font-sans font-normal opacity-50">₹</span>
                                    {order.final_amount.toLocaleString("en-IN")}
                                 </div>
                                 <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">Paid {order.payment_status}</span>
                              </div>
                           </TableCell>
                           <TableCell className="py-7 px-8">
                              <div className="flex justify-end">
                                 <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1 outline outline-1 outline-border/40">
                                    <ArrowRight className="h-4 w-4" />
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
