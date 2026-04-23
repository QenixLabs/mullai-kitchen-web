'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
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
import type { AdminCorporateCompany } from '@/api/types/admin-corporate.types';

interface CorporateCompanyTableProps {
  data: AdminCorporateCompany[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CorporateCompanyTable({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: CorporateCompanyTableProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8 text-muted-foreground">Loading companies...</div>;
  }

  if (!data.length) {
    return <div className="flex justify-center py-8 text-muted-foreground">No companies found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Delegate Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((company) => (
              <TableRow key={company._id}>
                <TableCell className="font-medium">{company.company_name}</TableCell>
                <TableCell>{company.gst_number || '-'}</TableCell>
                <TableCell>{company.delegate?.name || '-'}</TableCell>
                <TableCell>{company.delegate?.phone || '-'}</TableCell>
                <TableCell>{company.delegate?.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant={company.active_orders_count > 0 ? 'default' : 'secondary'}>
                    {company.active_orders_count}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={company.active_orders_count > 0 ? 'default' : 'outline'}
                    className={company.active_orders_count > 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : undefined}
                  >
                    {company.active_orders_count > 0 ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
