'use client';

import { useState } from 'react';
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

interface AssignPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
  routeId: string;
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
    role: UserRole.DeliveryPartner as any,
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Delivery Partner</DialogTitle>
          <DialogDescription>
            Select an active delivery partner to assign to this route.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search partners by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-64 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : partners.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active delivery partners found
              </p>
            ) : (
              partners.map((partner) => (
                <button
                  key={partner._id}
                  type="button"
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedPartnerId === partner._id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => setSelectedPartnerId(partner._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.phone}</p>
                    </div>
                    {partner.vehicle_number && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {partner.vehicle_number}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedPartnerId || assignPartner.isPending}
              onClick={handleAssign}
            >
              {assignPartner.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
