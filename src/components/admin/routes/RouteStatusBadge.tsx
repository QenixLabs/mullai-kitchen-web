'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type RouteStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<RouteStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  PUBLISHED: { label: 'Published', className: 'bg-info/15 text-info' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-warning/15 text-warning' },
  COMPLETED: { label: 'Completed', className: 'bg-success/15 text-success' },
  CANCELLED: { label: 'Cancelled', className: 'bg-destructive/15 text-destructive' },
};

export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
