'use client';

import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/Auth/can';
import { PlanStatus, MealType } from '@/api/types/admin-subscription.types';
import type { Plan } from '@/api/types/admin-subscription.types';

interface PlanTableProps {
  data: Plan[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (plan: Plan) => void;
  onStatusChange: (plan: Plan, status: PlanStatus) => void;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  [PlanStatus.PUBLISHED]: 'default',
  [PlanStatus.DRAFT]: 'secondary',
  [PlanStatus.ARCHIVED]: 'outline',
};

function formatMeals(meals: MealType[]): string {
  return meals.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
}

export function PlanTable({ data, isLoading, page, totalPages, onPageChange, onDelete, onStatusChange }: PlanTableProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Loading plans...</div>;
  }

  if (!data.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No plans found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Meals</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribers</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/plans/${plan._id}`} className="hover:underline">
                    {plan.name}
                  </Link>
                </TableCell>
                <TableCell>{plan.duration}</TableCell>
                <TableCell className="max-w-[200px] truncate">{formatMeals(plan.meals_included)}</TableCell>
                <TableCell>₹{plan.price.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[plan.status] || 'secondary'}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{plan.current_subscribers}{plan.max_subscribers ? `/${plan.max_subscribers}` : ''}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/plans/${plan._id}`}>
                          <Eye className="mr-2 h-4 w-4" />View / Edit
                        </Link>
                      </DropdownMenuItem>
                      <Can permission="plan:edit:global">
                        {plan.status === PlanStatus.DRAFT && (
                          <DropdownMenuItem onClick={() => onStatusChange(plan, PlanStatus.PUBLISHED)}>
                            <Pencil className="mr-2 h-4 w-4" />Publish
                          </DropdownMenuItem>
                        )}
                        {plan.status === PlanStatus.PUBLISHED && (
                          <DropdownMenuItem onClick={() => onStatusChange(plan, PlanStatus.ARCHIVED)}>
                            <Pencil className="mr-2 h-4 w-4" />Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(plan)}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
