'use client';

import { cn } from '@/lib/utils';

type RouteStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface StatusConfig {
  label: string;
  container: string;
  dot: string;
}

const statusConfig: Record<RouteStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    container: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
  PUBLISHED: {
    label: 'Published',
    container: 'border-info/20 bg-info/10 text-info',
    dot: 'bg-info',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    container: 'border-warning/20 bg-warning/10 text-warning',
    dot: 'bg-warning',
  },
  COMPLETED: {
    label: 'Completed',
    container: 'border-success/20 bg-success/10 text-success',
    dot: 'bg-success',
  },
  CANCELLED: {
    label: 'Cancelled',
    container: 'border-destructive/20 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
  },
};

export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    container: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        config.container,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
