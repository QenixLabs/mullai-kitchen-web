'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Truck,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building2,
} from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupplier, useDeleteSupplier } from '@/api/hooks/useInventory';

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: supplier, isLoading, error } = useSupplier(id);
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier.mutate(id, {
        onSuccess: () => router.push('/admin/inventory/suppliers'),
      });
    }
  };

  return (
    <Can
      permission="inventory:view"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
            <Truck className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Access Restricted</h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to view suppliers.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]">
              Supplier Details
            </h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]">
              View supplier information and purchase order history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Can permission="supplier:manage">
              <Button variant="outline" className="h-9 gap-1.5 rounded-full" asChild>
                <Link href={`/admin/inventory/suppliers/${id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can permission="supplier:manage">
              <Button
                variant="destructive"
                className="h-9 gap-1.5 rounded-full"
                onClick={handleDelete}
                disabled={deleteSupplier.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </Can>
            <Link
              href="/admin/inventory/suppliers"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : error || !supplier ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="p-5 rounded-2xl bg-destructive/10 mb-6">
              <Truck className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-primary">Supplier Not Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error instanceof Error
                ? error.message
                : 'The requested supplier could not be loaded.'}
            </p>
            <Link
              href="/admin/inventory/suppliers"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Suppliers
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Overview */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold uppercase text-primary ring-1 ring-primary/15">
                    {supplier.name.slice(0, 2)}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-primary">{supplier.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {supplier.contact_person || 'No contact person'}
                    </p>
                  </div>
                </div>
                <StatusPill status={supplier.status} />
              </div>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/5">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-primary">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={supplier.email} />
                <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={supplier.phone} />
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={supplier.address}
                  className="md:col-span-2"
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="rounded-2xl bg-white border border-border/40 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/5">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-primary">Business Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="GSTIN" value={supplier.gstin} />
                <InfoItem label="Bank Details" value={supplier.bank_details} />
                <InfoItem
                  label="Notes"
                  value={supplier.notes}
                  className="md:col-span-2"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Can>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'ACTIVE') {
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

function InfoItem({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-muted/30 border border-border/40 p-3 ${className || ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground flex items-center gap-2">
        {icon}
        {value || '—'}
      </p>
    </div>
  );
}
