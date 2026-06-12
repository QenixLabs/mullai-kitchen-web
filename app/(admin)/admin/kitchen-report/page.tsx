'use client';

import { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Printer,
  Download,
  ChefHat,
  Building2,
  Users,
  UtensilsCrossed,
  Coffee,
  Sun,
  Moon,
  ShoppingBag,
  Store,
  Loader2,
  Leaf,
  Beef,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { useCurrentUser } from '@/hooks/useUserStore';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useKitchenReport, downloadKitchenPdf } from '@/api/hooks/useKitchenReport';
import { UserRole } from '@/api/types/user.types';
import type { MealTypeBreakdown, CorporateCompanyItem } from '@/api/types/kitchen-report.types';
import { cn } from '@/lib/utils';

const mealTypeConfig: Record<
  string,
  { icon: React.ElementType; label: string }
> = {
  breakfast: { icon: Coffee, label: 'Breakfast' },
  lunch: { icon: Sun, label: 'Lunch' },
  dinner: { icon: Moon, label: 'Dinner' },
};

type StatTone = 'default' | 'success' | 'destructive' | 'info' | 'warning';

export default function KitchenReportPage() {
  const user = useCurrentUser();
  const canViewAnyOutlet = useHasPermission('outlet:view:any');
  const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const { data: outletsData, isLoading: outletsLoading } = useOutlets(
    canViewAnyOutlet ? { status: 'active' } : undefined,
  );

  const effectiveOutletId = useMemo(() => {
    if (!isSuperAdmin) return user?.assigned_outlet_id || '';
    if (selectedOutletId) return selectedOutletId;
    if (outletsData?.data?.length) return outletsData.data[0]._id;
    return '';
  }, [isSuperAdmin, user?.assigned_outlet_id, selectedOutletId, outletsData?.data]);

  const dateParam = format(selectedDate, 'yyyy-MM-dd');

  const { data: report, isLoading, error } = useKitchenReport(
    effectiveOutletId,
    dateParam,
  );

  const handleDownloadPdf = useCallback(async () => {
    if (!effectiveOutletId) return;
    setPdfDownloading(true);
    try {
      await downloadKitchenPdf(effectiveOutletId, dateParam);
    } finally {
      setPdfDownloading(false);
    }
  }, [effectiveOutletId, dateParam]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ChefHat className="size-16 text-muted-foreground/30" />
        <p className="text-lg text-muted-foreground">Failed to load kitchen report</p>
        <p className="text-sm text-muted-foreground/60">
          {(error as Error)?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Report</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily meal production breakdown for kitchen preparation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={!report}
          >
            <Printer className="size-4" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!effectiveOutletId || pdfDownloading || !report}
          >
            {pdfDownloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {isSuperAdmin && (
          <div className="w-full sm:w-64">
            <Select
              value={selectedOutletId}
              onValueChange={setSelectedOutletId}
              disabled={outletsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outlet" />
              </SelectTrigger>
              <SelectContent>
                {(outletsData?.data || []).map((outlet) => (
                  <SelectItem key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="w-full sm:w-56">
          <DatePicker
            date={selectedDate}
            onDateChange={(d) => d && setSelectedDate(d)}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-sm" />
            ))}
          </div>
          <Skeleton className="h-12 rounded-sm" />
          <Skeleton className="h-80 rounded-sm" />
        </div>
      )}

      {/* Report Content */}
      {report && (
        <div className="flex flex-col gap-6">
          {/* Outlet Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Store className="size-3.5" />
              {report.outlet.name}
            </Badge>
            <Badge variant="outline" className="font-normal">
              {new Date(report.date + 'T00:00:00').toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Badge>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={UtensilsCrossed}
              label="Total Meals"
              value={report.combined.total.total}
              tone="default"
            />
            <StatCard
              icon={Leaf}
              label="Veg Meals"
              value={report.combined.total.veg}
              tone="success"
            />
            <StatCard
              icon={Beef}
              label="Non-Veg Meals"
              value={report.combined.total.nonveg}
              tone="destructive"
            />
            <StatCard
              icon={Users}
              label="Individual"
              value={report.individual.total.total}
              tone="info"
            />
            <StatCard
              icon={Building2}
              label="Corporate"
              value={report.corporate.total.total}
              tone="warning"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="w-full sm:w-auto" variant="line">
              <TabsTrigger value="individual" className="gap-1.5">
                <Users className="size-4" />
                Individual Orders
              </TabsTrigger>
              <TabsTrigger value="corporate" className="gap-1.5">
                <Building2 className="size-4" />
                Corporate Orders
              </TabsTrigger>
              <TabsTrigger value="combined" className="gap-1.5">
                <UtensilsCrossed className="size-4" />
                Combined Summary
              </TabsTrigger>
            </TabsList>

            {/* Individual Tab */}
            <TabsContent value="individual" className="flex flex-col gap-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['breakfast', 'lunch', 'dinner'] as const).map((mt) => {
                  const data = report.individual[mt];
                  const config = mealTypeConfig[mt];
                  return (
                    <MealTypeCard
                      key={mt}
                      icon={config.icon}
                      label={config.label}
                      data={data}
                    />
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="size-4 text-primary" />
                    Source Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4">
                    <SourceStat
                      label="Subscription orders"
                      value={report.individual.source_breakdown.subscription_orders}
                    />
                    <Separator orientation="vertical" className="hidden sm:block h-8" />
                    <SourceStat
                      label="Add-on orders"
                      value={report.individual.source_breakdown.addon_orders}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Corporate Tab */}
            <TabsContent value="corporate" className="pt-4">
              {report.corporate.companies.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Building2 className="size-12 mx-auto mb-3 opacity-30" />
                    <p>No corporate orders for this date</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Corporate Orders</CardTitle>
                    <CardDescription>
                      {report.corporate.companies.length} companies · {report.corporate.total.total} meals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead className="hidden md:table-cell">Delivery Address</TableHead>
                          <TableHead className="text-right">Veg</TableHead>
                          <TableHead className="text-right">Non-Veg</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.corporate.companies.map((company) => (
                          <TableRow key={company.corporate_order_id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{company.company_name}</span>
                                <span className="text-xs text-muted-foreground md:hidden">
                                  {formatAddress(company.delivery_address)}
                                </span>
                                <span className="text-xs text-muted-foreground hidden md:inline">
                                  {company.order_id}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                              {formatAddress(company.delivery_address)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-success font-medium">{company.veg_count}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-destructive font-medium">{company.nonveg_count}</span>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {company.total_meals}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-semibold">
                          <TableCell>Corporate Total</TableCell>
                          <TableCell className="hidden md:table-cell" />
                          <TableCell className="text-right text-success">
                            {report.corporate.total.veg}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            {report.corporate.total.nonveg}
                          </TableCell>
                          <TableCell className="text-right">
                            {report.corporate.total.total}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Combined Tab */}
            <TabsContent value="combined" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Combined Meal Summary</CardTitle>
                  <CardDescription>
                    Individual and corporate orders combined by meal type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meal Type</TableHead>
                        <TableHead className="text-right">Individual</TableHead>
                        <TableHead className="text-right">Corporate</TableHead>
                        <TableHead className="text-right">Combined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(['breakfast', 'lunch', 'dinner'] as const).map((mt) => {
                        const entry = report.combined.by_meal_type[mt];
                        const config = mealTypeConfig[mt];
                        const Icon = config.icon;
                        return (
                          <TableRow key={mt}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Icon className="size-4 text-primary" />
                                <span className="font-medium">{config.label}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <MealCountCell veg={entry.individual.veg} nonveg={entry.individual.nonveg} total={entry.individual.total} />
                            </TableCell>
                            <TableCell className="text-right">
                              <MealCountCell veg={entry.corporate.veg} nonveg={entry.corporate.nonveg} total={entry.corporate.total} />
                            </TableCell>
                            <TableCell className="text-right font-semibold text-base">
                              {entry.combined.total}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>Grand Total</TableCell>
                        <TableCell className="text-right">
                          <MealCountCell veg={report.individual.total.veg} nonveg={report.individual.total.nonveg} total={report.individual.total.total} />
                        </TableCell>
                        <TableCell className="text-right">
                          <MealCountCell veg={report.corporate.total.veg} nonveg={report.corporate.total.nonveg} total={report.corporate.total.total} />
                        </TableCell>
                        <TableCell className="text-right text-lg">
                          {report.combined.total.total}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone?: StatTone;
}) {
  const toneStyles: Record<StatTone, string> = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardHeader>
        <CardAction>
          <div className={cn('p-2.5 rounded-full', toneStyles[tone])}>
            <Icon className="size-4" />
          </div>
        </CardAction>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function MealTypeCard({
  icon: Icon,
  label,
  data,
}: {
  icon: React.ElementType;
  label: string;
  data: MealTypeBreakdown;
}) {
  return (
    <Card className={cn(data.recipes.length === 0 && 'opacity-60')}>
      <CardHeader>
        <CardAction>
          <Badge variant="secondary" className="text-base px-2.5 py-1">
            {data.total}
          </Badge>
        </CardAction>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" />
          {label}
        </CardTitle>
        <CardDescription>
          <span className="text-success font-medium">{data.veg} veg</span>
          {' · '}
          <span className="text-destructive font-medium">{data.nonveg} non-veg</span>
        </CardDescription>
      </CardHeader>

      {data.recipes.length > 0 && (
        <>
          <Separator className="mx-6" />
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs text-muted-foreground">
                <span>Recipe</span>
                <span className="w-8 text-right">Veg</span>
                <span className="w-8 text-right">Non</span>
                <span className="w-10 text-right">Total</span>
              </div>
              {data.recipes.map((r) => (
                <div
                  key={r.recipe_id || r.recipe_name}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center text-sm"
                >
                  <span className="truncate font-medium">{r.recipe_name}</span>
                  <span className="w-8 text-right text-success">{r.veg_count}</span>
                  <span className="w-8 text-right text-destructive">{r.nonveg_count}</span>
                  <Badge variant="outline" className="w-10 justify-center px-0">
                    {r.total}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

function MealCountCell({
  veg,
  nonveg,
  total,
}: {
  veg: number;
  nonveg: number;
  total: number;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="font-semibold">{total}</span>
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-success">{veg} veg</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-destructive">{nonveg} non-veg</span>
      </div>
    </div>
  );
}

function SourceStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}

function formatAddress(address?: CorporateCompanyItem['delivery_address']) {
  if (!address) return '—';
  return [address.address_line, address.area, address.city].filter(Boolean).join(', ') || '—';
}
