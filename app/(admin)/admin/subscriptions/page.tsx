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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Manage customer subscriptions</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
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

      <SubscriptionTable
        data={data?.data ?? []}
        isLoading={isLoading}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
