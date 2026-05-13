'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { IDashboardAlert } from '@/api/types/admin.types';

interface DashboardAlertsProps {
  alerts?: IDashboardAlert[];
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

export function DashboardAlerts({ alerts, isLoading }: DashboardAlertsProps) {
  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <Skeleton className="h-[72px] w-full" />
      </Card>
    );
  }

  if (!alerts?.length) return null;

  const iconMap: Record<IDashboardAlert['type'], ReactNode> = {
    error: <XCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const toneMap: Record<IDashboardAlert['type'], string> = {
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardContent className="p-0">
        <HeaderStrip title="Alerts" icon={<AlertTriangle className="h-3.5 w-3.5" />} />
        <div className="divide-y divide-border/30">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 px-5 py-3">
              <span aria-hidden="true" className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', toneMap[alert.type])}>
                {iconMap[alert.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
              {alert.action && (
                <Button variant="outline" size="sm" asChild className="h-8">
                  <Link href={alert.action.href}>{alert.action.label}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
