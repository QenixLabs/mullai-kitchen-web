'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Store, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Can } from '@/components/Auth/can';
import { useOutlets, useDeleteOutlet } from '@/api/hooks/useOutlets';
import { OutletTable } from '@/components/admin/outlets/OutletTable';
import type { Outlet } from '@/api/outlet.api';

const PAGE_SIZE = 10;

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
  const deleteMutation = useDeleteOutlet();

  const outlets = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleDelete = useCallback(
    (outlet: Outlet) => {
      deleteMutation.mutate(outlet._id);
    },
    [deleteMutation],
  );

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Outlets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your kitchen outlets
          </p>
        </div>

        <Can permission="outlet:create">
          <Link href="/admin/outlets/create">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Outlet
            </Button>
          </Link>
        </Can>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search outlets..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Failed to load outlets
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Something went wrong while fetching the outlet list.
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : !isLoading && outlets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Store className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No outlets found
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              {search || statusFilter !== 'all'
                ? 'No outlets match your current filters. Try adjusting your search or status filter.'
                : 'Get started by creating your first kitchen outlet.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Can permission="outlet:create">
                <Link href="/admin/outlets/create">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Outlet
                  </Button>
                </Link>
              </Can>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {!isLoading && total > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {outlets.length} of {total} outlet{total !== 1 ? 's' : ''}
            </p>
          )}
          <OutletTable
            outlets={outlets}
            isLoading={isLoading}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                          className="px-1 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={page === item ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(item)}
                          className="h-8 w-8 p-0"
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
