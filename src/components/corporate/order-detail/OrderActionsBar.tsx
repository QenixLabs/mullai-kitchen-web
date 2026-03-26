"use client";

import { motion } from "motion/react";
import { 
  FileText, 
  Pencil, 
  X, 
  Loader2, 
  PlusCircle, 
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Building2,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderStatusBadge } from "@/components/corporate/OrderStatusBadge";
import type { ICorporateOrder } from "@/api/types/corporate.types";

interface OrderActionsBarProps {
  order: ICorporateOrder;
  hasFinalInvoice: boolean;
  onCancelClick: () => void;
  onModifyClick: () => void;
  onViewInvoicesClick: () => void;
  onGenerateFinalInvoice: () => void;
  isGeneratingFinal: boolean;
}

export function OrderActionsBar({
  order,
  hasFinalInvoice,
  onCancelClick,
  onModifyClick,
  onViewInvoicesClick,
  onGenerateFinalInvoice,
  isGeneratingFinal,
}: OrderActionsBarProps) {
  const { status } = order;
  const isActive = status === "active";
  const isPendingPayment = status === "pending_payment";
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="pointer-events-auto flex items-center gap-6 px-6 py-4 rounded-[2.5rem] bg-card/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-foreground/10 max-w-5xl w-full sm:w-auto"
      >
        {/* Order Identifier - Hidden on small mobile */}
        <div className="hidden lg:flex items-center gap-3 pr-6 border-r border-border/40">
           <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Current Order</span>
              <span className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">
                 {order.order_id}
              </span>
           </div>
        </div>

        {/* Global Status - Responsive */}
        <div className="flex items-center gap-4">
           <OrderStatusBadge status={status} className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border-0" />
           <div className="hidden sm:block h-3 w-px bg-border/40" />
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:flex-initial">
          {isActive && (
            <>
              <Button
                onClick={onModifyClick}
                className="h-11 px-6 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modify Meals</span>
                <span className="sm:hidden">Edit</span>
              </Button>

              <Button
                variant="outline"
                onClick={onViewInvoicesClick}
                className="h-11 px-6 rounded-2xl border-border/60 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all gap-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Records</span>
                <span className="sm:hidden">Bills</span>
              </Button>

              {/* Advanced Actions for Desktop */}
              {!isCancelled && (
                <div className="hidden sm:flex items-center pl-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl hover:bg-destructive/5 hover:text-destructive group">
                        <MoreHorizontal className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-2 rounded-2xl border-border/50 shadow-2xl min-w-[200px]">
                       <div className="px-3 py-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Advanced Operations</div>
                       <DropdownMenuItem 
                          onClick={onCancelClick}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer font-bold text-xs"
                       >
                          <Trash2 className="w-4 h-4" />
                          Terminate Order
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </>
          )}

          {isPendingPayment && (
             <>
               <Button
                  onClick={onViewInvoicesClick}
                  className="h-11 px-8 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all gap-2"
               >
                  <FileText className="w-3.5 h-3.5" />
                  Settle Invoice
               </Button>
               
               <Button
                  variant="ghost"
                  onClick={onCancelClick}
                  className="h-11 px-5 rounded-2xl text-destructive font-black text-[10px] uppercase tracking-widest hover:bg-destructive/5 whitespace-nowrap hidden sm:flex"
               >
                  Cancel
               </Button>
             </>
          )}

          {isCompleted && (
            <>
               {!hasFinalInvoice ? (
                 <Button
                    onClick={onGenerateFinalInvoice}
                    disabled={isGeneratingFinal}
                    className="h-11 px-8 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all gap-2"
                 >
                    {isGeneratingFinal ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    Final Settlement
                 </Button>
               ) : (
                 <div className="flex items-center gap-2 px-6 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cycle Finalized</span>
                 </div>
               )}
               
               <Button
                  variant="outline"
                  onClick={onViewInvoicesClick}
                  className="h-11 px-6 rounded-2xl border-border/60 font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all"
               >
                  Invoices
               </Button>
            </>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2 px-6 h-11 rounded-2xl bg-rose-500/5 text-rose-600 border border-rose-500/10 italic">
               <span className="text-[10px] font-bold">This Order has been terminated. Reference history is locked.</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
