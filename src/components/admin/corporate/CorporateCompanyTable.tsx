'use client';

import Link from 'next/link';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Phone,
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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Building2 className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Corporate Companies</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
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
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={0} />
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={total} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No companies found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or add a new corporate client.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total);

  return (
    <TooltipProvider delayDuration={250}>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={data.length} total={total} />
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Company
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                  GST
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                  Delegate
                </TableHead>
                <TableHead className="hidden h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground xl:table-cell">
                  Contact
                </TableHead>
                <TableHead className="h-10 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Orders
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="h-10 w-16 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((company, idx) => {
                const isLast = idx === data.length - 1;
                const isActive = company.active_orders_count > 0;
                return (
                  <TableRow
                    key={company._id}
                    className={cn(
                      'group transition-colors hover:bg-accent/20',
                      !isLast && 'border-b border-border/50',
                    )}
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary ring-1 ring-primary/15">
                          {getInitials(company.company_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {company.company_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {company.delegate?.designation || 'No designation'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 md:table-cell">
                      {company.gst_number ? (
                        <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">
                          {company.gst_number}
                        </code>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-sm font-medium text-foreground">
                        {company.delegate?.name || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 xl:table-cell">
                      <div className="space-y-0.5 text-xs">
                        {company.delegate?.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{company.delegate.phone}</span>
                          </div>
                        )}
                        {company.delegate?.email && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[180px]">
                                  {company.delegate.email}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">{company.delegate.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {!company.delegate?.phone && !company.delegate?.email && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ring-1',
                          isActive
                            ? 'bg-primary/10 text-primary ring-primary/15'
                            : 'bg-muted text-muted-foreground ring-border',
                        )}
                      >
                        {company.active_orders_count}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <StatusBadge active={isActive} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link href={`/admin/corporate/companies/${company._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">View company</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {totalPages > 1 ? (
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
              <span>
                Showing <span className="font-semibold text-foreground">{start}–{end}</span> of{' '}
                <span className="font-semibold text-foreground">{total}</span>
              </span>
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
                  const near = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
                  if (!near) {
                    if (p === page - 2 || p === page + 2)
                      return (
                        <span key={p} className="px-1 text-xs text-muted-foreground">
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
          ) : (
            <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{data.length}</span> compan
                {data.length === 1 ? 'y' : 'ies'}
                {total !== undefined && total !== data.length && (
                  <>
                    {' '}
                    · <span className="font-semibold text-foreground">{total}</span> total
                  </>
                )}
              </span>
              <span className="hidden sm:inline">Click eye icon to view</span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
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
