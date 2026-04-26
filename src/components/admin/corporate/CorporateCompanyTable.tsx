'use client';

import Link from 'next/link';
import { Eye, ChevronLeft, ChevronRight, Building2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AdminCorporateCompany } from '@/api/types/admin-corporate.types';

interface CorporateCompanyTableProps {
  data: AdminCorporateCompany[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function CorporateCompanyTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
}: CorporateCompanyTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-4 w-24 hidden lg:block" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No companies found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Try adjusting your search or add a new corporate client.
        </p>
      </div>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[260px]">Company</TableHead>
              <TableHead className="hidden md:table-cell">GST</TableHead>
              <TableHead className="hidden lg:table-cell">Delegate</TableHead>
              <TableHead className="hidden xl:table-cell">Contact</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-14 text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((company) => (
              <TableRow
                key={company._id}
                className="group transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={company.company_name} />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {company.company_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {company.delegate?.designation || 'No designation'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">
                  {company.gst_number || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="text-sm font-medium text-foreground">
                    {company.delegate?.name || '-'}
                  </div>
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="space-y-0.5 text-sm">
                    {company.delegate?.phone ? (
                      <span className="block text-muted-foreground">{company.delegate.phone}</span>
                    ) : null}
                    {company.delegate?.email ? (
                      <span className="block text-muted-foreground text-xs truncate max-w-[180px]">
                        {company.delegate.email}
                      </span>
                    ) : null}
                    {!company.delegate?.phone && !company.delegate?.email && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={company.active_orders_count > 0 ? 'default' : 'secondary'}
                    className={cn(
                      'tabular-nums',
                      company.active_orders_count > 0 &&
                        'bg-primary text-primary-foreground hover:bg-primary/90',
                    )}
                  >
                    {company.active_orders_count}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge active={company.active_orders_count > 0} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link href={`/admin/corporate/companies/${company._id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {start}–{end} of {total}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const near =
                Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
              if (!near) {
                if (p === page - 2 || p === page + 2)
                  return (
                    <span key={p} className="text-xs text-muted-foreground px-1">
                      …
                    </span>
                  );
                return null;
              }
              return (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="icon-sm"
                  onClick={() => onPageChange(p)}
                  className={cn(
                    'text-xs',
                    page === p && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
      {initials || <Building2 className="h-4 w-4" />}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Inactive
    </span>
  );
}
