import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  // DailyOrder statuses (lowercase)
  planned: { label: 'Planned', className: 'bg-info/15 text-info' },
  locked: { label: 'Locked', className: 'bg-muted text-muted-foreground' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-info/15 text-info' },
  delivered: { label: 'Delivered', className: 'bg-success/15 text-success' },
  missed: { label: 'Missed', className: 'bg-destructive/15 text-destructive' },
  paused: { label: 'Paused', className: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  opted_out: { label: 'Opted Out', className: 'bg-muted text-muted-foreground' },
  // AddOnOrder statuses (Capitalized)
  Pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  Confirmed: { label: 'Confirmed', className: 'bg-info/15 text-info' },
  Preparing: { label: 'Preparing', className: 'bg-warning/15 text-warning' },
  Delivered: { label: 'Delivered', className: 'bg-success/15 text-success' },
  Cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="secondary" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
