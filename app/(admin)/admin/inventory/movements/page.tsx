"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Search,
  Building2,
  Package,
  CalendarDays,
  SlidersHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  Minus,
  ListChecks,
  Loader2,
  PenLine,
  Boxes,
  Scale,
  Tag,
  FileText,
  Link2,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { DatePicker } from "@/components/ui/date-picker";
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
  DialogDescription,
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
  useStockMovements,
  useCreateStockMovement,
  useIngredients,
} from "@/api/hooks/useInventory";
import { UserRole } from "@/api/types/user.types";
import { cn } from "@/lib/utils";

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

const REASONS = [
  "PROCUREMENT",
  "CONSUMPTION",
  "WASTE",
  "ADJUSTMENT",
  "RETURN",
  "TRANSFER",
];

const movementSchema = z.object({
  outlet_id: z.string().min(1, "Outlet is required"),
  ingredient_id: z.string().min(1, "Ingredient is required"),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  reason: z.string().min(1, "Reason is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  reference_type: z.string().optional(),
  reference_id: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormValues = z.infer<typeof movementSchema>;

const LIMIT = 10;

export default function MovementsPage() {
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
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [recordOpen, setRecordOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createMovement = useCreateStockMovement();
  const { data: ingredientsData } = useIngredients({ limit: 100 });
  const ingredients = ingredientsData?.data ?? [];

  const movementForm = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema) as any,
    defaultValues: {
      outlet_id: selectedOutletId ?? "",
      ingredient_id: "",
      type: "IN",
      reason: "",
      quantity: 0,
      unit: "",
      reference_type: "",
      reference_id: "",
      notes: "",
    },
  });

  useEffect(() => {
    movementForm.setValue("outlet_id", selectedOutletId ?? "");
  }, [selectedOutletId]);

  // Auto-set movement type based on reason
  const watchedReason = movementForm.watch("reason");
  useEffect(() => {
    const reasonToType: Record<string, string> = {
      CONSUMPTION: "OUT",
      WASTE: "OUT",
      PROCUREMENT: "IN",
      RETURN: "IN",
      ADJUSTMENT: "ADJUSTMENT",
      TRANSFER: "OUT",
    };
    const expectedType = reasonToType[watchedReason];
    if (expectedType && movementForm.getValues("type") !== expectedType) {
      movementForm.setValue("type", expectedType as "IN" | "OUT" | "ADJUSTMENT");
    }
  }, [watchedReason, movementForm]);

  const onMovementSubmit: SubmitHandler<MovementFormValues> = (data) => {
    createMovement.mutate(
      {
        outlet_id: data.outlet_id,
        ingredient_id: data.ingredient_id,
        type: data.type,
        reason: data.reason,
        quantity: Number(data.quantity),
        unit: data.unit,
        reference_type: data.reference_type || undefined,
        reference_id: data.reference_id || undefined,
        notes: data.notes || undefined,
      },
      {
        onSuccess: () => {
          setRecordOpen(false);
          movementForm.reset();
        },
      },
    );
  };

  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id]);

  useEffect(() => {
    if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
      setSelectedOutletId(outletsData.data[0]._id);
    }
  }, [canViewAnyOutlet, selectedOutletId, outletsData?.data]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [search]);

  const params = useMemo(
    () => ({
      outlet_id: selectedOutletId ?? undefined,
      search: debouncedSearch || undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
      from_date: fromDate ? fromDate.toISOString().split("T")[0] : undefined,
      to_date: toDate ? toDate.toISOString().split("T")[0] : undefined,
      page,
      limit: LIMIT,
    }),
    [selectedOutletId, debouncedSearch, typeFilter, fromDate, toDate, page],
  );

  const { data, isLoading } = useStockMovements(params);
  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const stats = useMemo(() => {
    const all = data?.data ?? [];
    const totalMovements = all.length;
    const stockIn = all.filter((m) => m.type === "IN").length;
    const stockOut = all.filter((m) => m.type === "OUT").length;
    const adjustments = all.filter((m) => m.type === "ADJUSTMENT").length;
    return { totalMovements, stockIn, stockOut, adjustments };
  }, [data]);

  const selectedOutlet = useMemo(
    () => outletsData?.data?.find((o) => o._id === selectedOutletId),
    [outletsData?.data, selectedOutletId],
  );

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ArrowLeftRight className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Stock Movements
            </h1>
            <p className="text-sm text-muted-foreground">
              Ledger of all stock ins, outs, and adjustments.
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
          label="Total Movements"
          value={isLoading ? "—" : stats.totalMovements.toString()}
          tone="primary"
        />
        <StatCard
          icon={<ArrowDownLeft className="h-4 w-4" />}
          label="Stock In"
          value={isLoading ? "—" : stats.stockIn.toString()}
          tone="success"
        />
        <StatCard
          icon={<ArrowUpRight className="h-4 w-4" />}
          label="Stock Out"
          value={isLoading ? "—" : stats.stockOut.toString()}
          tone="warning"
        />
        <StatCard
          icon={<Minus className="h-4 w-4" />}
          label="Adjustments"
          value={isLoading ? "—" : stats.adjustments.toString()}
          tone="info"
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
              Type
            </span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-[140px]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="IN">In</SelectItem>
                <SelectItem value="OUT">Out</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              From
            </span>
            <DatePicker
              date={fromDate}
              onDateChange={setFromDate}
              placeholder="Start date"
              className="h-9 w-[150px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
              To
            </span>
            <DatePicker
              date={toDate}
              onDateChange={setToDate}
              placeholder="End date"
              className="h-9 w-[150px]"
            />
          </div>

          <div className="ml-auto">
            <Can permission="stock:adjustment">
              <Button
                className="h-9 gap-1.5"
                onClick={() => setRecordOpen(true)}
              >
                <ArrowLeftRight className="h-4 w-4" />
                Record Movement
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>

      {/* Content Card */}
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={rows.length} total={total} />

          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  No movements found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust filters or record a new stock movement.
                </p>
              </div>
            </div>
          ) : (
            <TooltipProvider delayDuration={250}>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                      Reason
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Ingredient
                    </TableHead>
                    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                      Unit
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                      Reference
                    </TableHead>
                    <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                      Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((m, idx) => {
                    const isLast = idx === rows.length - 1;
                    return (
                      <TableRow
                        key={m._id}
                        className={cn(
                          "group transition-colors hover:bg-accent/20",
                          !isLast && "border-b border-border/50",
                        )}
                      >
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(m.created_at), "dd MMM yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <MovementTypeChip type={m.type} />
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 md:table-cell">
                          <span className="text-sm text-foreground">
                            {m.reason}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm font-medium text-foreground">
                            {typeof m.ingredient_id === "object"
                              ? m.ingredient_id.name
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="text-sm tabular-nums text-foreground">
                            {m.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 lg:table-cell">
                          <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                            {m.unit}
                          </code>
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 xl:table-cell">
                          {m.reference_type ? (
                            <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                              {m.reference_type}
                            </code>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden px-4 py-3 xl:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {m.notes || "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
              <span>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">{total}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">
                  {rows.length}
                </span>{" "}
                movement{rows.length === 1 ? "" : "s"}
                {total > 0 && total !== rows.length && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-semibold text-foreground">
                      {total}
                    </span>{" "}
                    total
                  </>
                )}
              </span>
              <span className="hidden sm:inline">
                Filter by date range to narrow results
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Movement Dialog */}
      <Can permission="inventory:manage">
        {" "}
        <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-base">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <PenLine className="h-3.5 w-3.5" />
                </span>
                Record Stock Movement
              </DialogTitle>
              <DialogDescription>
                Log a stock in, out, or adjustment for the selected outlet.
              </DialogDescription>
            </DialogHeader>

            {selectedOutlet && (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Outlet:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {selectedOutlet.name}
                </span>
              </div>
            )}

            <Form {...movementForm}>
              <form
                onSubmit={movementForm.handleSubmit(onMovementSubmit)}
                className="space-y-4"
              >
                {/* Ingredient */}
                <FormField
                  control={movementForm.control}
                  name="ingredient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Boxes className="h-3 w-3" />
                        Ingredient *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl border-border/60 bg-white text-sm">
                            <SelectValue placeholder="Select ingredient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing._id} value={ing._id}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type + Reason */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={movementForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <ArrowLeftRight className="h-3 w-3" />
                          Type *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-border/60 bg-white text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="IN">IN</SelectItem>
                            <SelectItem value="OUT">OUT</SelectItem>
                            <SelectItem value="ADJUSTMENT">
                              ADJUSTMENT
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={movementForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          Reason *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-border/60 bg-white text-sm">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REASONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quantity + Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={movementForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Scale className="h-3 w-3" />
                          Quantity *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value ?? ""}
                            placeholder="e.g. 12.5"
                            className="h-10 rounded-xl border-border/60 bg-white px-3 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={movementForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Package className="h-3 w-3" />
                          Unit *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl border-border/60 bg-white text-sm">
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
                </div>

                {/* Reference */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={movementForm.control}
                    name="reference_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Link2 className="h-3 w-3" />
                          Reference Type
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="e.g. PURCHASE_ORDER"
                            className="h-10 rounded-xl border-border/60 bg-white px-3 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={movementForm.control}
                    name="reference_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          Reference ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Optional ID"
                            className="h-10 rounded-xl border-border/60 bg-white px-3 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={movementForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          rows={2}
                          placeholder="Optional context for this movement..."
                          className="rounded-xl border-border/60 bg-white px-3 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                    onClick={() => setRecordOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMovement.isPending}
                    className="h-9 gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    {createMovement.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    Record Movement
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

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Movements
        </h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0
              ? `${count} on this page · ${total} total`
              : `${total} total`}
          </span>
        )}
      </div>
    </div>
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

function MovementTypeChip({ type }: { type: string }) {
  if (type === "IN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-success">
        <ArrowDownLeft className="h-3 w-3" />
        In
      </span>
    );
  }
  if (type === "OUT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-warning/20 bg-warning/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
        <ArrowUpRight className="h-3 w-3" />
        Out
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-info/20 bg-info/10 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-info">
      <Minus className="h-3 w-3" />
      Adjustment
    </span>
  );
}
