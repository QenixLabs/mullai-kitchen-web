'use client';

import { useEffect, useState } from 'react';
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

  const isSuperAdmin = user?.role === UserRole.SuperAdmin;

  useEffect(() => {
    if (!isSuperAdmin && user?.assigned_outlet_id) {
      setSelectedOutletId(user.assigned_outlet_id);
      onOutletChange(user.assigned_outlet_id);
    }
  }, [isSuperAdmin, user?.assigned_outlet_id, onOutletChange]);

  // Auto-select first outlet for SUPER_ADMIN when list loads
  useEffect(() => {
    if (isSuperAdmin && !selectedOutletId && outletsData?.data?.length) {
      const firstId = outletsData.data[0]._id;
      setSelectedOutletId(firstId);
      onOutletChange(firstId);
    }
  }, [isSuperAdmin, selectedOutletId, outletsData?.data, onOutletChange]);

  const handleOutletChange = (value: string) => {
    setSelectedOutletId(value);
    onOutletChange(value);
  };

  if (!isSuperAdmin) {
    if (!selectedOutletId) {
      return <Skeleton className="h-10 w-64" />;
    }
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      {isLoading ? (
        <Skeleton className="h-10 w-64" />
      ) : (
        <Select value={selectedOutletId} onValueChange={handleOutletChange}>
          <SelectTrigger className="w-64">
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
