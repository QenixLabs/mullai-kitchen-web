'use client';

import Link from 'next/link';
import {
  Eye,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
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

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-28 rounded-md hidden md:block" />
              <Skeleton className="h-4 w-24 hidden lg:block" />
              <Skeleton className="h-4 w-32 hidden xl:block" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 ml-auto rounded-md" />
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
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
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

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b">
              <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company
              </TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                GST
              </TableHead>
              <TableHead className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Delegate
              </TableHead>
              <TableHead className="hidden xl:table-cell text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Orders
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-24 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((company) => {
              const isActive = company.active_orders_count > 0;
              return (
                <TableRow
                  key={company._id}
                  className="group transition-colors hover:bg-muted/30 border-b last:border-0"
                >
                  {/* Company */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 bg-primary/10 text-primary font-semibold text-sm">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(company.company_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {company.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {company.delegate?.designation || 'No designation'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* GST */}
                  <TableCell className="hidden md:table-cell py-4">
                    {company.gst_number ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border-slate-200"
                      >
                        {company.gst_number}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Delegate */}
                  <TableCell className="hidden lg:table-cell py-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 bg-secondary text-secondary-foreground text-[10px] font-bold">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {getInitials(company.delegate?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {company.delegate?.name || '—'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="hidden xl:table-cell py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {company.delegate?.phone && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0 text-primary/70" />
                          <span>{company.delegate.phone}</span>
                        </div>
                      )}
                      {company.delegate?.email && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate max-w-[180px]">
                            {company.delegate.email}
                          </span>
                        </div>
                      )}
                      {!company.delegate?.phone && !company.delegate?.email && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Orders */}
                  <TableCell className="py-4 text-right">
                    <Badge
                      variant={isActive ? 'default' : 'outline'}
                      className={cn(
                        'text-xs font-semibold tabular-nums',
                        isActive
                          ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {company.active_orders_count} orders
                    </Badge>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          isActive ? 'bg-success' : 'bg-muted-foreground'
                        )}
                      />
                      <Badge
                        variant={isActive ? 'success' : 'inactive'}
                        className="text-xs"
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="pr-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-70 group-hover:opacity-100 transition-opacity h-8 px-3"
                      asChild
                    >
                      <Link href={`/admin/corporate/companies/${company._id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing{' '}
            <span className="font-medium text-foreground">{start}</span>
            –
            <span className="font-medium text-foreground">{end}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span>
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(page - 1)}
                  className={cn(
                    page <= 1 && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
              {getPageNumbers().map((p, i) =>
                p === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => onPageChange(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(page + 1)}
                  className={cn(
                    page >= totalPages && 'pointer-events-none opacity-50'
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{data.length}</span>{' '}
            compan{data.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      )}
    </div>
  );
}
