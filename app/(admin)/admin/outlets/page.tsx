'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { useOutlets } from '@/api/hooks/useOutlets';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { BentoStatsCard } from '@/components/admin/layout/BentoStatsCard';
import { OutletCard } from '@/components/admin/outlets/OutletCard';
import { ProvisionSiteCard } from '@/components/admin/outlets/ProvisionSiteCard';
import { cn } from '@/lib/utils';
import type { Outlet } from '@/api/outlet.api';

const PAGE_SIZE = 12;

// Static mock data for UI preview
const MOCK_OUTLETS: Outlet[] = [
  {
    _id: 'out-001',
    name: 'Downtown Central',
    address: '7th Ave, Metro Plaza, Suite 402',
    city: 'Chennai',
    pincode: '600001',
    contact_phone: '+91-9876543210',
    contact_email: 'downtown@mullai.com',
    status: 'active',
    operational_hours: {
      breakfast: { start_time: '07:00', end_time: '10:00' },
      lunch: { start_time: '12:00', end_time: '15:00' },
      dinner: { start_time: '19:00', end_time: '22:00' },
    },
    kitchen_capacity: 800,
    manager: 'Elena Vance',
    delivery_zones: [],
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-06-10T14:30:00Z',
  },
  {
    _id: 'out-002',
    name: 'Southside Hub',
    address: 'Industrial District, Block D',
    city: 'Chennai',
    pincode: '600042',
    contact_phone: '+91-9876543211',
    contact_email: 'southside@mullai.com',
    status: 'active',
    operational_hours: {
      breakfast: { start_time: '07:00', end_time: '10:00' },
      lunch: { start_time: '12:00', end_time: '15:00' },
      dinner: { start_time: '19:00', end_time: '22:00' },
    },
    kitchen_capacity: 1200,
    manager: 'Marcus Thorne',
    delivery_zones: [],
    created_at: '2024-02-20T09:00:00Z',
    updated_at: '2024-06-12T11:00:00Z',
  },
  {
    _id: 'out-003',
    name: 'Northern Express',
    address: 'Greenway Tech Park',
    city: 'Chennai',
    pincode: '600113',
    contact_phone: '+91-9876543212',
    contact_email: 'northern@mullai.com',
    status: 'active',
    operational_hours: {
      breakfast: { start_time: '07:00', end_time: '10:00' },
      lunch: { start_time: '12:00', end_time: '15:00' },
      dinner: { start_time: '19:00', end_time: '22:00' },
    },
    kitchen_capacity: 1000,
    manager: 'David Wu',
    delivery_zones: [],
    created_at: '2024-03-05T07:30:00Z',
    updated_at: '2024-06-11T16:45:00Z',
  },
  {
    _id: 'out-004',
    name: 'Westbay Bakery',
    address: 'Ocean Drive, Pier 12',
    city: 'Chennai',
    pincode: '600028',
    contact_phone: '+91-9876543213',
    contact_email: 'westbay@mullai.com',
    status: 'inactive',
    operational_hours: {
      breakfast: { start_time: '07:00', end_time: '10:00' },
      lunch: { start_time: '12:00', end_time: '15:00' },
      dinner: { start_time: '19:00', end_time: '22:00' },
    },
    kitchen_capacity: 350,
    manager: 'Sarah Jenkins',
    delivery_zones: [],
    created_at: '2024-04-10T10:00:00Z',
    updated_at: '2024-06-09T09:15:00Z',
  },
];

export default function OutletsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  const queryParams = {
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isError, refetch } = useOutlets(queryParams);

  const outlets = data?.data?.length ? data.data : MOCK_OUTLETS;
  const totalPages = data?.totalPages ?? 1;

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    [],
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatusFilter(value as 'all' | 'active' | 'inactive');
      setPage(1);
    },
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="MANAGE OUTLETS"
        subtitle="Oversee operational efficiency across 12 active culinary centers."
      >
        <Can permission="outlet:create">
          <Link href="/admin/outlets/create">
            <Button
              size="sm"
              className="rounded-full bg-gradient-to-r from-[#39070F] to-[#4F0D1A] text-white hover:from-[#2D0610] hover:to-[#3D0815]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Outlet
            </Button>
          </Link>
        </Can>
      </AdminPageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BentoStatsCard
          label="ACTIVE CAPACITY"
          value="4,250 Meals/Day"
          subtitle="+12%"
          icon={TrendingUp}
          variant="success"
        />
        <BentoStatsCard
          label="AVG. DELIVERY TIME"
          value="24 min"
          subtitle="Target: 30 min"
          icon={Clock}
          variant="warning"
        />
        <BentoStatsCard
          label="ACTIVE ORDERS"
          value="184"
          icon={Flame}
          variant="primary"
        />
      </div>

      {/* Filters */}
      <div
        className="rounded-3xl border p-4"
        style={{ borderColor: 'rgba(219,192,193,0.2)', backgroundColor: 'rgba(255,255,255,0.6)' }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#554243]" />
            <Input
              placeholder="Search outlets..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px] rounded-xl border-[rgba(219,192,193,0.3)] bg-white text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <Card className="rounded-3xl border-[rgba(219,192,193,0.2)]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-[#3d000c] mb-1">
              Failed to load outlets
            </h3>
            <p className="text-sm text-[#554243] mb-6">
              Something went wrong while fetching the outlet list.
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white p-5"
              style={{ border: '1px solid rgba(219,192,193,0.2)' }}
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-6 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
              <div className="mt-4" style={{ borderTop: '1px solid rgba(219,192,193,0.2)' }} />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-2 h-6 w-20" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-2 h-6 w-24" />
                </div>
              </div>
              <Skeleton className="mt-4 h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Outlet Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outlets.map((outlet, idx) => (
              <OutletCard key={outlet._id} outlet={outlet} index={idx} />
            ))}
            <ProvisionSiteCard />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#554243]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0) {
                        const prev = arr[idx - 1];
                        if (p - prev > 1) {
                          acc.push('ellipsis');
                        }
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-[#554243]"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(item)}
                          className={cn(
                            'h-8 w-8 p-0 rounded-lg border-[rgba(219,192,193,0.3)]',
                            page === item
                              ? 'bg-gradient-to-r from-[#44151c] to-[#44151c]/80 text-white shadow-sm border-transparent'
                              : 'bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]',
                          )}
                        >
                          {item}
                        </Button>
                      ),
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
