'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  ClipboardList,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Auth/can';
import { cn } from '@/lib/utils';
import { PlanStatus, MealType } from '@/api/types/admin-subscription.types';
import type { Plan } from '@/api/types/admin-subscription.types';

interface PlanTableProps {
  data: Plan[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
  onDelete: (plan: Plan) => void;
  onStatusChange: (plan: Plan, status: PlanStatus) => void;
}

const statusClass: Record<string, string> = {
  [PlanStatus.PUBLISHED]: 'bg-success/10 text-success border-success/20',
  [PlanStatus.DRAFT]: 'bg-warning/10 text-warning border-warning/20',
  [PlanStatus.ARCHIVED]: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const durationBadge: Record<string, string> = {
  Weekly: 'bg-info/10 text-info border-info/20',
  Monthly: 'bg-primary/10 text-primary border-primary/20',
  Quarterly: 'bg-gold/10 text-gold border-gold/20',
};

function formatMeals(meals: MealType[]): string {
  return meals.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
}

export function PlanTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onDelete,
  onStatusChange,
}: PlanTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-8 ml-auto" />
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
        <h3 className="text-lg font-semibold text-foreground">No plans found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, total ?? data.length);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-14 hidden sm:table-cell">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead className="hidden lg:table-cell">Meals</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell text-right">Subscribers</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((plan) => (
              <TableRow
                key={plan._id}
                className="group transition-colors hover:bg-primary/[0.03]"
              >
                <TableCell className="hidden sm:table-cell">
                  {plan.image_url ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                      <Image
                        src={plan.image_url}
                        alt={plan.name}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/plans/${plan._id}`}
                    className="hover:text-primary hover:underline transition-colors"
                  >
                    {plan.name}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusPill className={durationBadge[plan.duration]}>
                    {plan.duration}
                  </StatusPill>
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                  {formatMeals(plan.meals_included)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  ₹{plan.price.toLocaleString()}
                </TableCell>
                <TableCell>
                  <StatusPill className={statusClass[plan.status]}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </StatusPill>
                </TableCell>
                <TableCell className="hidden xl:table-cell text-right tabular-nums">
                  {plan.current_subscribers}
                  {plan.max_subscribers ? ` / ${plan.max_subscribers}` : ''}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/plans/${plan._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View / Edit
                        </Link>
                      </DropdownMenuItem>
                      <Can permission="plan:edit:global">
                        {plan.status === PlanStatus.DRAFT && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(plan, PlanStatus.PUBLISHED)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {plan.status === PlanStatus.PUBLISHED && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(plan, PlanStatus.ARCHIVED)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(plan)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Showing {start}–{end} of {total ?? data.length}
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
                    page === p &&
                      'bg-primary text-primary-foreground hover:bg-primary/90',
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

function StatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        className,
      )}
    >
      {children}
    </span>
  );
}
