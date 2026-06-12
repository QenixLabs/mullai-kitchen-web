'use client';

import type { ReactNode } from 'react';
import { Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHasPermission } from '@/hooks/useHasPermission';
import Link from 'next/link';
import type { ICorporateMetrics } from '@/api/types/admin.types';

interface DashboardCorporatePulseProps {
  data?: ICorporateMetrics;
  isLoading?: boolean;
}

function HeaderStrip({ title, icon }: { title: string; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          {icon}
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      </div>
    </div>
  );
}

export function DashboardCorporatePulse({ data, isLoading }: DashboardCorporatePulseProps) {
  const canViewCorporate = useHasPermission(['corporate:view:any', 'corporate:view:outlet'], false);
  const formatCurrency = (n?: number) => (n ? `₹${n.toLocaleString('en-IN')}` : '₹0');

  if (!canViewCorporate) return null;

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <Skeleton className="h-[200px] w-full" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardContent className="p-0">
        <HeaderStrip title="Corporate Pulse" icon={<Briefcase className="h-3.5 w-3.5" />} />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Active Orders</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{(data?.activeOrders ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Today&rsquo;s Meals</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{(data?.todayMeals ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Overdue Invoices</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground tabular-nums">{data?.overdueInvoices ?? 0}</p>
              {(data?.overdueInvoices ?? 0) > 0 && (
                <Link
                  href="/admin/corporate/invoices?status=overdue"
                  className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 hover:bg-rose-100"
                >
                  View
                </Link>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-rose-600 tabular-nums">{formatCurrency(data?.outstandingAmount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
