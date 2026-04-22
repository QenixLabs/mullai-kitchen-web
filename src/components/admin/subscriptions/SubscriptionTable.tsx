'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';
import type { AdminSubscription } from '@/api/types/admin-subscription.types';

interface SubscriptionTableProps {
  data: AdminSubscription[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    [SubscriptionStatus.ACTIVE]: { label: 'Active', bg: 'rgba(0,153,15,0.12)', color: '#00990f' },
    [SubscriptionStatus.PAUSED]: { label: 'Paused', bg: 'rgba(217,119,6,0.12)', color: '#d97706' },
    [SubscriptionStatus.EXPIRED]: { label: 'Expired', bg: 'rgba(219,192,193,0.22)', color: '#554243' },
    [SubscriptionStatus.CANCELLED]: { label: 'Cancelled', bg: 'rgba(255,0,4,0.12)', color: '#ff0004' },
  };
  const c = configs[status] || configs[SubscriptionStatus.EXPIRED];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-[rgba(219,192,193,0.3)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: '#44151c' }}
        />
      </div>
      <span className="text-[10px] font-bold" style={{ color: '#554243' }}>
        {pct}%
      </span>
    </div>
  );
}

function getSubscriberName(sub: AdminSubscription): string {
  if (typeof sub.user_id === 'object' && sub.user_id !== null) {
    return sub.user_id.name || sub.user_id.email || 'Unknown';
  }
  return 'Unknown';
}

function getSubscriberInitials(sub: AdminSubscription): string {
  const name = getSubscriberName(sub);
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getProgress(sub: AdminSubscription): number {
  if (!sub.total_deliveries) return 0;
  return Math.round((sub.completed_deliveries / sub.total_deliveries) * 100);
}

export function SubscriptionTable({ data, isLoading, page, totalPages, onPageChange }: SubscriptionTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#44151c] border-t-transparent" />
        <p className="mt-3 text-sm" style={{ color: '#554243' }}>Loading subscriptions...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full p-4 mb-3" style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}>
          <Eye className="h-6 w-6" style={{ color: '#44151c' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: '#3d000c' }}>No subscriptions found</p>
        <p className="text-xs mt-1" style={{ color: '#554243' }}>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(219,192,193,0.2)' }}>
                {['Subscriber', 'Plan', 'Outlet', 'Meals', 'Status', 'Period', 'Progress', ''].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#554243' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((sub, idx) => (
                <tr
                  key={sub._id}
                  style={{
                    borderBottom:
                      idx < data.length - 1 ? '1px solid rgba(219,192,193,0.15)' : 'none',
                  }}
                  className="transition-colors hover:bg-[rgba(68,21,28,0.02)]"
                >
                  {/* Subscriber */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: '#44151c' }}
                      >
                        {getSubscriberInitials(sub)}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#3d000c' }}>
                        {getSubscriberName(sub)}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium" style={{ color: '#44151c' }}>
                      {sub.plan_name}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: '#554243' }}>
                      {sub.outlet_name}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: '#554243' }}>
                      {sub.meals_included.join(', ')}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={sub.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs" style={{ color: '#554243' }}>
                        {new Date(sub.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs" style={{ color: '#554243' }}>
                        {new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <ProgressBar pct={getProgress(sub)} />
                  </td>

                  <td className="px-5 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-[#554243] hover:text-[#44151c] hover:bg-[rgba(68,21,28,0.06)]"
                      asChild
                    >
                      <Link href={`/admin/subscriptions/${sub._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: '#554243' }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
