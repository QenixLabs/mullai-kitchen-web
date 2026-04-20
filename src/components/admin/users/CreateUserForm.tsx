'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Loader2,
  Save,
  ShieldCheck,
  User,
  Lock,
  Building2,
  Bike,
} from 'lucide-react';
import { useHasPermission } from '@/hooks/useHasPermission';
import {
  useCreateAdminUser,
  useCreateHubOwner,
  useCreateDeliveryPartner,
} from '@/api/hooks/useAdminUsers';
import { useOutlets } from '@/api/hooks/useOutlets';
import type {
  CreateAdminUserPayload,
  CreateHubOwnerPayload,
  CreateDeliveryPartnerPayload,
} from '@/api/admin-user.api';

const formSchema = z
  .object({
    role: z.enum(['admin', 'hubOwner', 'deliveryPartner']),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(1, 'Phone is required'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[a-z]/, 'Must contain lowercase')
      .regex(/[0-9]/, 'Must contain number'),
    assigned_outlet_id: z.string().optional(),
    vehicle_type: z.string().optional(),
    vehicle_number: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'hubOwner' || data.role === 'deliveryPartner') {
        return !!data.assigned_outlet_id;
      }
      return true;
    },
    { message: 'Outlet is required for this role', path: ['assigned_outlet_id'] }
  );

type CreateUserFormValues = z.infer<typeof formSchema>;

const ROLE_OPTIONS = [
  { value: 'admin' as const, label: 'Admin', permission: 'user:create:admin' },
  { value: 'hubOwner' as const, label: 'Hub Owner', permission: 'user:create:hub' },
  { value: 'deliveryPartner' as const, label: 'Delivery Partner', permission: 'user:create:delivery' },
];

const VEHICLE_TYPE_OPTIONS = [
  { value: 'Bike', label: 'Bike' },
  { value: 'Scooter', label: 'Scooter' },
  { value: 'Cycle', label: 'Cycle' },
  { value: 'Other', label: 'Other' },
];

export function CreateUserForm() {
  const router = useRouter();

  const canCreateAdmin = useHasPermission('user:create:admin');
  const canCreateHub = useHasPermission('user:create:hub');
  const canCreateDelivery = useHasPermission('user:create:delivery');

  const availableRoles = useMemo(
    () =>
      ROLE_OPTIONS.filter((opt) => {
        if (opt.value === 'admin') return canCreateAdmin;
        if (opt.value === 'hubOwner') return canCreateHub;
        if (opt.value === 'deliveryPartner') return canCreateDelivery;
        return false;
      }),
    [canCreateAdmin, canCreateHub, canCreateDelivery]
  );

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: undefined,
      name: '',
      email: '',
      phone: '',
      password: '',
      assigned_outlet_id: undefined,
      vehicle_type: undefined,
      vehicle_number: '',
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
  } = form;

  const selectedRole = watch('role');

  // Auto-select role when only one is available
  useEffect(() => {
    if (availableRoles.length === 1 && !selectedRole) {
      setValue('role', availableRoles[0].value);
    }
  }, [availableRoles, selectedRole, setValue]);

  const createAdminUser = useCreateAdminUser();
  const createHubOwner = useCreateHubOwner();
  const createDeliveryPartner = useCreateDeliveryPartner();
  const { data: outletsData } = useOutlets();
  const outlets = outletsData?.data ?? [];

  const isSubmitting =
    createAdminUser.isPending ||
    createHubOwner.isPending ||
    createDeliveryPartner.isPending;

  const onSubmit = (values: CreateUserFormValues) => {
    const basePayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    };

    switch (values.role) {
      case 'admin': {
        const payload: CreateAdminUserPayload = basePayload;
        createAdminUser.mutate(payload, {
          onSuccess: () => router.push('/admin/users'),
        });
        break;
      }
      case 'hubOwner': {
        const payload: CreateHubOwnerPayload = {
          ...basePayload,
          assigned_outlet_id: values.assigned_outlet_id!,
        };
        createHubOwner.mutate(payload, {
          onSuccess: () => router.push('/admin/users'),
        });
        break;
      }
      case 'deliveryPartner': {
        const payload: CreateDeliveryPartnerPayload = {
          ...basePayload,
          assigned_outlet_id: values.assigned_outlet_id!,
          vehicle_type: values.vehicle_type || undefined,
          vehicle_number: values.vehicle_number || undefined,
        };
        createDeliveryPartner.mutate(payload, {
          onSuccess: () => router.push('/admin/users'),
        });
        break;
      }
    }
  };

  const showOutletSection =
    selectedRole === 'hubOwner' || selectedRole === 'deliveryPartner';
  const showVehicleSection = selectedRole === 'deliveryPartner';

  const inputClass =
    'h-11 rounded-xl border-border/60 bg-card px-4 text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/30';

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2 text-base font-semibold text-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="p-2 rounded-xl bg-primary/5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                User Role
              </CardTitle>
            </CardHeader>
            <CardContent>
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Select Role <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 2: Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="p-2 rounded-xl bg-primary/5">
                <User className="h-4 w-4 text-primary" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Full name"
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="user@example.com"
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Phone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+91 98765 43210"
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: Account Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-base font-semibold text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="p-2 rounded-xl bg-primary/5">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter a secure password"
                      className={inputClass}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and a
                    number.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 4: Outlet Assignment (hubOwner / deliveryPartner) */}
      {showOutletSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2 text-base font-semibold text-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="p-2 rounded-xl bg-primary/5">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                Outlet Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={control}
                name="assigned_outlet_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Assigned Outlet <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={inputClass}>
                          <SelectValue placeholder="Select an outlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {outlets.map((outlet) => (
                            <SelectItem key={outlet._id} value={outlet._id}>
                              {outlet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Section 5: Vehicle Details (deliveryPartner only) */}
      {showVehicleSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="rounded-3xl bg-card border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2 text-base font-semibold text-primary"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <div className="p-2 rounded-xl bg-primary/5">
                  <Bike className="h-4 w-4 text-primary" />
                </div>
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="vehicle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Vehicle Type
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className={inputClass}>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            {VEHICLE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="vehicle_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Vehicle Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="TN 01 AB 1234"
                          className={inputClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end"
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-primary px-8 text-sm font-semibold text-white hover:bg-primary/90 transition-colors sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create User
            </>
          )}
        </Button>
      </motion.div>
      </form>
    </Form>
  );
}
