'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { useAdminSubscriptions } from '@/api/hooks/useAdminSubscriptions';
import { SubscriptionTable } from '@/components/admin/subscriptions/SubscriptionTable';
import { SubscriptionStatus } from '@/api/types/admin-subscription.types';

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminSubscriptions({
    search: search || undefined,
    status: (status as SubscriptionStatus) || undefined,
    page,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Subscriptions"
        subtitle="Manage customer subscriptions"
      />

      {/* Filters */}
      <div
        className="rounded-3xl border p-4"
        style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 rounded-xl border-border/60 bg-white"
            />
          </div>

          <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
            <SelectTrigger className="w-40 rounded-xl border-border/60 bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={SubscriptionStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={SubscriptionStatus.PAUSED}>Paused</SelectItem>
              <SelectItem value={SubscriptionStatus.EXPIRED}>Expired</SelectItem>
              <SelectItem value={SubscriptionStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="rounded-3xl bg-white p-6"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        <SubscriptionTable
          data={data?.data ?? []}
          isLoading={isLoading}
          page={page}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
