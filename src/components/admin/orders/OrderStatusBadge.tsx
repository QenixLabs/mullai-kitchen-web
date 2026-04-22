import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  // DailyOrder statuses (lowercase)
  planned: {
    label: 'Planned',
    bg: 'rgba(217,119,6,0.12)',
    text: '#d97706',
    dot: '#d97706',
  },
  locked: {
    label: 'Locked',
    bg: 'rgba(85,66,67,0.1)',
    text: '#554243',
    dot: '#554243',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bg: 'rgba(0,153,15,0.12)',
    text: '#00990f',
    dot: '#00990f',
  },
  delivered: {
    label: 'Delivered',
    bg: 'rgba(0,153,15,0.12)',
    text: '#00990f',
    dot: '#00990f',
  },
  missed: {
    label: 'Missed',
    bg: 'rgba(255,0,4,0.12)',
    text: '#ff0004',
    dot: '#ff0004',
  },
  paused: {
    label: 'Paused',
    bg: 'rgba(85,66,67,0.1)',
    text: '#554243',
    dot: '#554243',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'rgba(85,66,67,0.1)',
    text: '#554243',
    dot: '#554243',
  },
  opted_out: {
    label: 'Opted Out',
    bg: 'rgba(85,66,67,0.1)',
    text: '#554243',
    dot: '#554243',
  },
  // AddOnOrder statuses (Capitalized)
  Pending: {
    label: 'Pending',
    bg: 'rgba(217,119,6,0.12)',
    text: '#d97706',
    dot: '#d97706',
  },
  Confirmed: {
    label: 'Confirmed',
    bg: 'rgba(0,153,15,0.12)',
    text: '#00990f',
    dot: '#00990f',
  },
  Preparing: {
    label: 'Preparing',
    bg: 'rgba(68,21,28,0.1)',
    text: '#44151c',
    dot: '#44151c',
  },
  Delivered: {
    label: 'Delivered',
    bg: 'rgba(0,153,15,0.12)',
    text: '#00990f',
    dot: '#00990f',
  },
  Cancelled: {
    label: 'Cancelled',
    bg: 'rgba(85,66,67,0.1)',
    text: '#554243',
    dot: '#554243',
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'rgba(85,66,67,0.1)',
    text: '#554243',
    dot: '#554243',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold'
      )}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.dot }}
      />
      {config.label}
    </span>
  );
}
