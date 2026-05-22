'use client';

import { useMemo } from 'react';
import { Utensils } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IIngredientUsageItem } from '@/api/types/admin.types';

interface DashboardIngredientUsageProps {
  data?: IIngredientUsageItem[];
  isLoading?: boolean;
}

export function DashboardIngredientUsage({
  data,
  isLoading,
}: DashboardIngredientUsageProps) {
  const formatCurrency = (n?: number) =>
    n ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹0';

  const rows = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Utensils className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold">
            Ingredient Usage Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No ingredient usage recorded for today.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Utensils className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-semibold">
          Ingredient Usage Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty Used</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.ingredientId}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">{item.category}</TableCell>
                <TableCell className="text-right">
                  {item.quantityUsed.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.unitCost)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.totalCost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
