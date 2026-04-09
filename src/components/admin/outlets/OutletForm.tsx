'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Save, Clock, Users, Building2, Phone, MapPin } from 'lucide-react';
import type { Outlet, CreateOutletPayload } from '@/api/outlet.api';

const outletSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().min(1, 'Pincode is required').regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
  contact_phone: z.string().min(1, 'Phone is required'),
  contact_email: z.string().email('Valid email required'),
  operational_hours: z.object({
    breakfast: z.object({
      start_time: z.string(),
      end_time: z.string(),
    }),
    lunch: z.object({
      start_time: z.string(),
      end_time: z.string(),
    }),
    dinner: z.object({
      start_time: z.string(),
      end_time: z.string(),
    }),
  }),
  kitchen_capacity: z.number().min(1).optional(),
  manager: z.string().optional(),
  established_date: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export type OutletFormValues = z.infer<typeof outletSchema>;

export interface OutletFormHandle {
  validate: () => Promise<OutletFormValues>;
}

interface OutletFormProps {
  mode: 'create' | 'edit';
  initialData?: Outlet;
  onSubmit: (data: CreateOutletPayload) => void;
  isSubmitting: boolean;
  hideSubmitButton?: boolean;
}

const defaultValues: OutletFormValues = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  contact_phone: '',
  contact_email: '',
  operational_hours: {
    breakfast: { start_time: '07:00', end_time: '10:00' },
    lunch: { start_time: '12:00', end_time: '15:00' },
    dinner: { start_time: '19:00', end_time: '22:00' },
  },
  kitchen_capacity: undefined,
  manager: '',
  established_date: '',
  location: undefined,
};

function getInitialValues(data?: Outlet): OutletFormValues {
  if (!data) return defaultValues;
  return {
    name: data.name || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    pincode: data.pincode || '',
    contact_phone: data.contact_phone || '',
    contact_email: data.contact_email || '',
    operational_hours: data.operational_hours || defaultValues.operational_hours,
    kitchen_capacity: data.kitchen_capacity ?? undefined,
    manager: data.manager || '',
    established_date: data.established_date
      ? data.established_date.split('T')[0]
      : '',
    location: data.location ?? undefined,
  };
}

export const OutletForm = forwardRef<OutletFormHandle, OutletFormProps>(function OutletForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  hideSubmitButton = false,
}, ref) {
  const form = useForm<OutletFormValues>({
    resolver: zodResolver(outletSchema),
    defaultValues: getInitialValues(initialData),
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const valid = await form.trigger();
      if (!valid) throw new Error('Validation failed');
      return form.getValues();
    },
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleFormSubmit = (values: OutletFormValues) => {
    const payload: CreateOutletPayload = {
      name: values.name,
      address: values.address,
      city: values.city || undefined,
      state: values.state || undefined,
      pincode: values.pincode,
      contact_phone: values.contact_phone,
      contact_email: values.contact_email,
      operational_hours: values.operational_hours,
      kitchen_capacity: values.kitchen_capacity ?? undefined,
      manager: values.manager || undefined,
      established_date: values.established_date || undefined,
      location: values.location,
    };
    onSubmit(payload);
  };

  const inputClass =
    'h-11 rounded-xl border-border/60 bg-white px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="rounded-2xl bg-white border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="p-2 rounded-xl bg-primary/5">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Outlet Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('name')}
                  placeholder="e.g. Mullai Kitchen - Anna Nagar"
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('address')}
                  placeholder="Full street address"
                  className={inputClass}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  City
                </Label>
                <Input
                  {...register('city')}
                  placeholder="Chennai"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  State
                </Label>
                <Input
                  {...register('state')}
                  placeholder="Tamil Nadu"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pincode <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('pincode')}
                  placeholder="600040"
                  className={inputClass}
                />
                {errors.pincode && (
                  <p className="text-xs text-destructive">{errors.pincode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Location Coordinates Section (edit mode only) */}
      {mode === 'edit' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <Card className="rounded-2xl bg-white border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2 text-base font-semibold text-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="p-2 rounded-xl bg-primary/5">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                Location Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Latitude
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    {...register('location.lat', { valueAsNumber: true })}
                    placeholder="13.0827"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Longitude
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    {...register('location.lng', { valueAsNumber: true })}
                    placeholder="80.2707"
                    className={inputClass}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="rounded-2xl bg-white border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="p-2 rounded-xl bg-primary/5">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('contact_phone')}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
                {errors.contact_phone && (
                  <p className="text-xs text-destructive">
                    {errors.contact_phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('contact_email')}
                  type="email"
                  placeholder="outlet@mullaikitchen.com"
                  className={inputClass}
                />
                {errors.contact_email && (
                  <p className="text-xs text-destructive">
                    {errors.contact_email.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Operational Hours Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="rounded-2xl bg-white border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="p-2 rounded-xl bg-primary/5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Operational Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(
                [
                  { key: 'breakfast', label: 'Breakfast' },
                  { key: 'lunch', label: 'Lunch' },
                  { key: 'dinner', label: 'Dinner' },
                ] as const
              ).map((slot) => (
                <div key={slot.key}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {slot.label}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Start Time
                      </Label>
                      <Input
                        type="time"
                        {...register(`operational_hours.${slot.key}.start_time`)}
                        placeholder="HH:MM"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        End Time
                      </Label>
                      <Input
                        type="time"
                        {...register(`operational_hours.${slot.key}.end_time`)}
                        placeholder="HH:MM"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Capacity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="rounded-2xl bg-white border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="p-2 rounded-xl bg-primary/5">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Capacity & Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kitchen Capacity
                </Label>
                <Input
                  type="number"
                  {...register('kitchen_capacity', { valueAsNumber: true })}
                  placeholder="100"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Manager
                </Label>
                <Input
                  {...register('manager')}
                  placeholder="Manager name"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Established Date
                </Label>
                <Input
                  type="date"
                  {...register('established_date')}
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      {!hideSubmitButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-end gap-4 pt-2"
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary px-8 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'create' ? 'Create Outlet' : 'Save Changes'}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </form>
  );
});
