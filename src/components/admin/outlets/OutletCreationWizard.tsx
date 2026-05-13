'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { OutletForm, type OutletFormHandle, type OutletFormValues } from '@/components/admin/outlets/OutletForm';
import { OutletCreationMap, type PendingZone } from '@/components/admin/outlets/OutletCreationMap';
import { outletApi } from '@/api/outlet.api';
import type { CreateOutletPayload } from '@/api/outlet.api';
import { adminDeliveryZoneApi } from '@/api/delivery-zone.api';

export function OutletCreationWizard() {
  const router = useRouter();
  const formRef = useRef<OutletFormHandle>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<OutletFormValues | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [zones, setZones] = useState<PendingZone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 → Step 2
  const handleNext = useCallback(async () => {
    if (!formRef.current) return;
    try {
      const values = await formRef.current.validate();
      setFormData(values);
      setStep(2);
    } catch {
      // Validation errors shown by react-hook-form
      toast.error('Please fill in all required fields');
    }
  }, []);

  // Step 2 → Step 1
  const handleBack = useCallback(() => {
    setStep(1);
  }, []);

  // Submit: Create outlet then create zones
  const handleCreateOutlet = useCallback(async () => {
    if (!formData) return;
    setIsSubmitting(true);
    try {
      // 1. Create outlet
      const payload: CreateOutletPayload = {
        name: formData.name,
        address: formData.address,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email,
        location,
        operational_hours: formData.operational_hours,
        kitchen_capacity: formData.kitchen_capacity ?? undefined,
        manager: formData.manager || undefined,
        established_date: formData.established_date || undefined,
        config: formData.config?.planning_cutoff_time ? formData.config : undefined,
      };

      const outlet = await outletApi.create(payload);

      // 2. Create zones
      const failedZones: string[] = [];
      for (const zone of zones) {
        try {
          await adminDeliveryZoneApi.create(outlet._id, {
            name: zone.name,
            description: zone.description,
            zone_type: zone.zone_type,
            boundary: zone.boundary,
            center: zone.center,
            radius_km: zone.radius_km,
            is_active: zone.is_active,
          });
        } catch {
          failedZones.push(zone.name);
        }
      }

      // 3. Toast + navigate
      if (failedZones.length > 0) {
        toast.warning(
          `Outlet "${outlet.name}" created, but ${failedZones.length} zone(s) failed: ${failedZones.join(', ')}. You can add them from the zones page.`,
          { duration: 6000 }
        );
      } else if (zones.length > 0) {
        toast.success(`Outlet "${outlet.name}" created with ${zones.length} delivery zone${zones.length > 1 ? 's' : ''}`);
      } else {
        toast.success(`Outlet "${outlet.name}" created successfully`);
      }
      router.push('/admin/outlets');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create outlet');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, location, zones, router]);

  if (step === 1) {
    return (
      <>
        <OutletForm
          ref={formRef}
          mode="create"
          onSubmit={() => {}} // Wizard controls submission
          isSubmitting={false}
          hideSubmitButton
          initialData={formData ? {
            _id: '',
            name: formData.name,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email,
            status: 'active',
            operational_hours: formData.operational_hours,
            kitchen_capacity: formData.kitchen_capacity,
            manager: formData.manager,
            established_date: formData.established_date,
            delivery_zones: [],
            created_at: '',
            updated_at: '',
            config: formData.config,
          } : undefined}
        />
        {/* Next button */}
        <div className="mx-auto w-full max-w-7xl mt-5 px-4 pb-8 sm:px-6 lg:px-8 flex items-center justify-end">
          <button
            onClick={handleNext}
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Next: Set Location & Zones
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <OutletCreationMap
      outletName={formData?.name || 'New Outlet'}
      initialLocation={location}
      onLocationSelect={setLocation}
      zones={zones}
      onZonesChange={setZones}
      onBack={handleBack}
      onCreateOutlet={handleCreateOutlet}
      isLoading={isSubmitting}
    />
  );
}
