'use client';

import { useState } from 'react';
import { Check, Phone, Search, Truck, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers } from '@/api/hooks/useAdminUsers';
import { useAssignPartner } from '@/api/hooks/useAdminRoutes';
import { UserRole } from '@/api/types/user.types';
import { cn } from '@/lib/utils';

interface AssignPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  routeId: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AssignPartnerDialog({
  open,
  onOpenChange,
  outletId,
  routeId,
}: AssignPartnerDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const { data: partnersData, isLoading } = useAdminUsers({
    role: UserRole.DeliveryPartner,
    status: 'active',
    outlet_id: outletId,
    search: search || undefined,
    limit: 50,
  });

  const assignPartner = useAssignPartner(outletId);

  const handleAssign = () => {
    if (!selectedPartnerId) return;
    assignPartner.mutate(
      { routeId, data: { partner_id: selectedPartnerId } },
      {
        onSuccess: () => {
          setSelectedPartnerId(null);
          setSearch('');
          onOpenChange(false);
        },
      },
    );
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedPartnerId(null);
      setSearch('');
    }
    onOpenChange(nextOpen);
  };

  const partners = partnersData?.users || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <Truck className="h-3.5 w-3.5" />
            </span>
            Assign Delivery Partner
          </DialogTitle>
          <DialogDescription>
            Pick an active delivery partner to assign to this route.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search partners by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>

          <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-md" />
                ))}
              </div>
            ) : partners.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 px-4 py-8 text-center">
                <span className="rounded-full bg-muted p-2 text-muted-foreground">
                  <UserX className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-foreground">No partners found</p>
                <p className="text-xs text-muted-foreground">
                  {search ? 'Try a different search term.' : 'No active delivery partners for this outlet.'}
                </p>
              </div>
            ) : (
              partners.map((partner) => {
                const isSelected = selectedPartnerId === partner._id;
                return (
                  <button
                    key={partner._id}
                    type="button"
                    onClick={() => setSelectedPartnerId(partner._id)}
                    className={cn(
                      'group w-full rounded-md border px-3 py-2 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/15'
                        : 'border-border/70 bg-background hover:border-primary/40 hover:bg-accent/30',
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase ring-1',
                          isSelected
                            ? 'bg-primary text-primary-foreground ring-primary/30'
                            : 'bg-primary/10 text-primary ring-primary/15',
                        )}
                      >
                        {getInitials(partner.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {partner.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{partner.phone}</span>
                        </div>
                      </div>
                      {partner.vehicle_number && (
                        <code className="shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {partner.vehicle_number}
                        </code>
                      )}
                      {isSelected && (
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5"
              disabled={!selectedPartnerId || assignPartner.isPending}
              onClick={handleAssign}
            >
              <Check className="h-3.5 w-3.5" />
              {assignPartner.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
