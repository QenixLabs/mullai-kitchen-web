"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  Search,
  SlidersHorizontal,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Ban,
  ListChecks,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Can } from "@/components/Auth/can";
import { useCurrentUser } from "@/hooks/useUserStore";
import { useHasPermission } from "@/hooks/useHasPermission";
import { useOutlets } from "@/api/hooks/useOutlets";
import {
  useStockLevels,
  useAdjustStock,
  useIngredients,
} from "@/api/hooks/useInventory";
import { UserRole } from "@/api/types/user.types";
import { cn } from "@/lib/utils";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { StockLevel } from "@/api/admin-inventory.api";

export default function StockPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission("outlet:view:any");
  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: "active" } : undefined,
  );

  const isSuperAdmin =
    user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<StockLevel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [search]);

  const effectiveOutletId = useMemo(() => {
    if (!isSuperAdmin) return user?.assigned_outlet_id || null;
    if (selectedOutletId) return selectedOutletId;
    if (outletsData?.data?.length) return outletsData.data[0]._id;
    return null;
  }, [isSuperAdmin, user?.assigned_outlet_id, selectedOutletId, outletsData?.data]);

  const { data: stockData, isLoading } = useStockLevels(
    effectiveOutletId ?? undefined,
  );

  const rows = useMemo(() => {
    const all = stockData ?? [];
    return all.filter((item) => {
      const matchesSearch = debouncedSearch
        ? (typeof item.ingredient_id === "object"
            ? item.ingredient_id.name
            : ""
          )
            ?.toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        : true;
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stockData, debouncedSearch, statusFilter]);

  const stats = useMemo(() => {
    const all = stockData ?? [];
    const totalItems = all.length;
    const inStock = all.filter((i) => i.status === "IN_STOCK").length;
    const lowStock = all.filter((i) => i.status === "LOW_STOCK").length;
    const outOfStock = all.filter((i) => i.status === "OUT_OF_STOCK").length;
    return { totalItems, inStock, lowStock, outOfStock };
  }, [stockData]);

  const selectedOutlet = useMemo(
    () => outletsData?.data?.find((o) => o._id === effectiveOutletId),
    [outletsData?.data, effectiveOutletId],
  );

  const adjustStock = useAdjustStock();
  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const ingredients = ingredientsData?.data ?? [];

  const adjustSchema = z.object({
    outlet_id: z.string().min(1, "Outlet is required"),
    ingredient_id: z.string().min(1, "Ingredient is required"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    notes: z.string().optional(),
  });
  type AdjustFormValues = z.infer<typeof adjustSchema>;

  const adjustForm = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema) as Resolver<AdjustFormValues>,
    defaultValues: {
      outlet_id: "",
      ingredient_id: "",
      quantity: 0,
      unit: "",
      notes: "",
    },
  });

  const openAdjust = (item: StockLevel | null) => {
    setAdjustItem(item);
    if (item) {
      const ingId =
        typeof item.ingredient_id === "object"
          ? item.ingredient_id._id
          : item.ingredient_id;
      const ingName =
        typeof item.ingredient_id === "object" ? item.ingredient_id.name : "";
      const unit =
        typeof item.ingredient_id === "object"
          ? (item.ingredient_id as { default_unit?: string }).default_unit || item.unit
          : item.unit;
      adjustForm.reset({
        outlet_id: selectedOutletId ?? "",
        ingredient_id: ingId,
        quantity: 0,
        unit,
        notes: "",
      });
    } else {
      adjustForm.reset({
        outlet_id: selectedOutletId ?? "",
        ingredient_id: "",
        quantity: 0,
        unit: "",
        notes: "",
      });
    }
    setAdjustOpen(true);
  };

  const onAdjustSubmit = (data: AdjustFormValues) => {
    adjustStock.mutate(
      {
        outlet_id: data.outlet_id,
        ingredient_id: data.ingredient_id,
        quantity: Number(data.quantity),
        unit: data.unit,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          setAdjustOpen(false);
          adjustForm.reset();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Package className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Stock Levels
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time inventory per outlet with status indicators.
            </p>
          </div>
        </div>
        {selectedOutlet && (
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {selectedOutlet.name}
          </span>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ListChecks className="h-4 w-4" />}
          label="Total Items"
          value={isLoading ? "—" : stats.totalItems.toString()}
          tone="primary"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="In Stock"
          value={isLoading ? "—" : stats.inStock.toString()}
          tone="success"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Low Stock"
          value={isLoading ? "—" : stats.lowStock.toString()}
          tone="warning"
        />
        <StatCard
          icon={<Ban className="h-4 w-4" />}
          label="Out of Stock"
          value={isLoading ? "—" : stats.outOfStock.toString()}
          tone="destructive"
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          {canViewAnyOutlet && (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
                Outlet
              </span>
              {outletsLoading ? (
                <Skeleton className="h-9 w-[220px]" />
              ) : (
                <Select
                  value={selectedOutletId ?? ""}
                  onValueChange={setSelectedOutletId}
                >
                  <SelectTrigger className="h-9 w-[220px] gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Select an outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {(outletsData?.data || []).map((outlet) => (
                      <SelectItem key={outlet._id} value={outlet._id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search ingredient..."
              className="h-9 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              Status
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[160px]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto">
            <Can permission="stock:adjustment">
              <Button className="h-9 gap-1.5" onClick={() => openAdjust(null)}>
                <SlidersHorizontal className="h-4 w-4" />
                Adjust Stock
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={rows.length} />

          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  No stock records
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select an outlet or adjust filters to view stock levels.
                </p>
              </div>
            </div>
          ) : (
            <TooltipProvider delayDuration={250}>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Ingredient
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Current Qty
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Unit
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Last Updated
                    </TableHead>
                    <TableHead className="h-10 w-16 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item, idx) => {
                    const isLast = idx === rows.length - 1;
                    const ingredientName =
                      typeof item.ingredient_id === "object"
                        ? item.ingredient_id.name
                        : "—";
                    return (
                      <TableRow
                        key={item._id}
                        className={cn(
                          "group transition-colors hover:bg-accent/20",
                          !isLast && "border-b border-border/50",
                        )}
                      >
                        <TableCell className="px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">
                            {ingredientName}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm tabular-nums text-foreground">
                            {item.current_quantity}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 md:table-cell">
                          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                            {item.unit}
                          </code>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <StockStatusPill status={item.status} />
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {item.last_movement_at
                              ? new Date(
                                  item.last_movement_at,
                                ).toLocaleDateString("en-IN")
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Can permission="stock:adjustment">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => openAdjust(item)}
                                >
                                  <SlidersHorizontal className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">Adjust stock</p>
                              </TooltipContent>
                            </Tooltip>
                          </Can>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}

          <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {rows.length}
              </span>{" "}
              item{rows.length === 1 ? "" : "s"}
            </span>
            <span className="hidden sm:inline">
              Stock levels update with every movement
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Can permission="stock:adjustment">
        {" "}
        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                Adjust Stock
              </DialogTitle>
            </DialogHeader>
            <Form {...adjustForm}>
              <form
                onSubmit={adjustForm.handleSubmit(onAdjustSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={adjustForm.control}
                  name="ingredient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Ingredient *
                      </FormLabel>
                      <FormControl>
                        {adjustItem ? (
                          <Input
                            readOnly
                            value={
                              typeof adjustItem.ingredient_id === "object"
                                ? adjustItem.ingredient_id.name
                                : ""
                            }
                            className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                          />
                        ) : (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                              <SelectValue placeholder="Select ingredient" />
                            </SelectTrigger>
                            <SelectContent>
                              {ingredients.map((ing) => (
                                <SelectItem key={ing._id} value={ing._id}>
                                  {ing.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adjustForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Quantity *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""}
                          placeholder="e.g., 10"
                          className="h-11 rounded-xl border-border/60 bg-white px-4 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adjustForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Unit *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl border-border/60 bg-white text-sm">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adjustForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Optional notes..."
                          className="min-h-[80px] rounded-xl border-border/60 bg-white px-4 py-3 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAdjustOpen(false)}
                    className="h-10 rounded-full px-6 text-sm font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={adjustStock.isPending}
                    className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    {adjustStock.isPending && (
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>{" "}
      </Can>
    </div>
  );
}

const UNITS = [
  "KG",
  "G",
  "L",
  "ML",
  "PCS",
  "DOZEN",
  "PACKET",
  "BOTTLE",
  "BUNCH",
];

function HeaderStrip({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Package className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Stock Levels
        </h3>
        {count > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count} items
          </span>
        )}
      </div>
    </div>
  );
}

function StockStatusPill({ status }: { status: string }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        <Ban className="h-3 w-3" />
        Unknown
      </span>
    );
  }
  const normalized = status.trim().toUpperCase();
  if (normalized === "IN_STOCK") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <CheckCircle2 className="h-3 w-3" />
        In Stock
      </span>
    );
  }
  if (normalized === "LOW_STOCK") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
        <AlertTriangle className="h-3 w-3" />
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
      <Ban className="h-3 w-3" />
      Out of Stock
    </span>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: "primary" | "success" | "warning" | "info" | "destructive" | "muted";
}

function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-success/15 text-success ring-success/20",
    warning: "bg-warning/15 text-warning ring-warning/20",
    info: "bg-info/15 text-info ring-info/20",
    destructive: "bg-rose-50 text-rose-600 ring-rose-100",
    muted: "bg-muted text-muted-foreground ring-border",
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {sub && (
              <p className="truncate text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
              toneStyles[tone],
            )}
          >
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
