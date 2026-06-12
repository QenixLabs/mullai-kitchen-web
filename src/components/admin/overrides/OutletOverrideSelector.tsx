'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useOutlets } from '@/api/hooks/useOutlets';
import { useCurrentUser } from '@/hooks/useUserStore';
import { UserRole } from '@/api/types/user.types';

interface OutletOverrideSelectorProps {
  onOutletChange: (outletId: string) => void;
}

export function OutletOverrideSelector({ onOutletChange }: OutletOverrideSelectorProps) {
  const user = useCurrentUser();
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const { data: outletsData, isLoading } = useOutlets({ status: 'active' });
  const notifiedIdRef = useRef<string>('');

  const isSuperAdmin = user?.role === UserRole.SuperAdmin;

  const effectiveOutletId = useMemo(() => {
    if (!isSuperAdmin) return user?.assigned_outlet_id || '';
    if (selectedOutletId) return selectedOutletId;
    if (outletsData?.data?.length) return outletsData.data[0]._id;
    return '';
  }, [isSuperAdmin, user?.assigned_outlet_id, selectedOutletId, outletsData?.data]);

  useEffect(() => {
    if (effectiveOutletId && effectiveOutletId !== notifiedIdRef.current) {
      notifiedIdRef.current = effectiveOutletId;
      onOutletChange(effectiveOutletId);
    }
  }, [effectiveOutletId, onOutletChange]);

  const handleOutletChange = useCallback((value: string) => {
    setSelectedOutletId(value);
    onOutletChange(value);
  }, [onOutletChange]);

  if (!isSuperAdmin) {
    if (!effectiveOutletId) {
      return <Skeleton className="h-9 w-64" />;
    }
    const outlet = outletsData?.data?.find((o) => o._id === effectiveOutletId);
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-background px-3 text-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium text-foreground">{outlet?.name || 'Your outlet'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
        Outlet
      </span>
      {isLoading ? (
        <Skeleton className="h-9 w-64" />
      ) : (
        <Select value={effectiveOutletId} onValueChange={handleOutletChange}>
          <SelectTrigger className="h-9 w-[260px] gap-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Select an outlet" />
          </SelectTrigger>
          <SelectContent>
            {(outletsData?.data || []).map((outlet) => (
              <SelectItem key={outlet._id} value={outlet._id}>
                {outlet.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
