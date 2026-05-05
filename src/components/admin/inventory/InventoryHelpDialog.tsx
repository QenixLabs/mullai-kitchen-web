'use client';

import { useState } from 'react';
import {
  HelpCircle,
  ChefHat,
  Package,
  ArrowLeftRight,
  ClipboardList,
  Truck,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Minus,
  Lightbulb,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function StepCard({ icon, title, description, color }: StepCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          color
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function InventoryHelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                <Lightbulb className="h-3.5 w-3.5" />
              </span>
              How Inventory Works
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Think of inventory like a restaurant pantry. You track what you
              buy, what you use, and what you have left. Here is how the five
              pieces fit together.
            </p>

            <div className="space-y-2.5">
              <StepCard
                icon={<ChefHat className="h-4 w-4 text-primary" />}
                title="1. Ingredients — Your Product Catalog"
                description="This is the master list of everything you track: Tomato, Basmati Rice, Chicken, etc. Each ingredient has a default unit (KG, L, PCS) and a minimum stock level that tells you when to reorder."
                color="bg-primary/10"
              />

              <StepCard
                icon={<Package className="h-4 w-4 text-success" />}
                title="2. Stock — What is in the Kitchen Right Now"
                description="This shows the live quantity per outlet. Example: Test Tomato 20 KG at Velachery. You never edit this number directly; it updates automatically when you record movements."
                color="bg-success/10"
              />

              <StepCard
                icon={<ArrowLeftRight className="h-4 w-4 text-info" />}
                title="3. Movements — The Ledger"
                description="Every stock change creates a movement record. IN adds stock (receipts), OUT removes stock (cooking consumption), and ADJUSTMENT corrects counts after physical inventory."
                color="bg-info/10"
              />

              <StepCard
                icon={<ClipboardList className="h-4 w-4 text-warning" />}
                title="4. Procurement — Buying from Suppliers"
                description="Create a Purchase Order (PO) for your supplier. When the goods arrive, click Receive Goods. This automatically creates an IN movement and updates your stock."
                color="bg-warning/10"
              />

              <StepCard
                icon={<Truck className="h-4 w-4 text-muted-foreground" />}
                title="5. Suppliers — Who You Buy From"
                description="Maintain a list of vendors like Fresh Veggies Co. You can link a preferred supplier to each ingredient so PO creation is faster."
                color="bg-muted"
              />
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Boxes className="h-3 w-3" />
                Recipe BOM (Bill of Materials)
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Link recipes to ingredients with quantities and wastage factors.
                For example: Keema Paratha needs 0.5 KG Tomato + 5% wastage. The
                nightly auto-deduct job reads how many recipes were cooked and
                automatically creates OUT movements to reduce stock.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ArrowDownLeft className="h-3 w-3 text-success" />
                <ArrowUpRight className="h-3 w-3 text-warning" />
                <Minus className="h-3 w-3 text-info" />
                Movement Types at a Glance
              </h4>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                    IN
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock arriving — procurement receipts, returns, transfers in
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-warning/20 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
                    OUT
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock leaving — kitchen consumption, waste, transfers out
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-info/20 bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">
                    ADJUSTMENT
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stock correction — physical count mismatch, spoilage
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border/70 pt-3">
              <Button
                size="sm"
                className="h-9 gap-1.5 rounded-lg"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
