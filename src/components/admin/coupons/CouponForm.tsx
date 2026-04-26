'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, TicketPercent, Search } from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCreateCoupon, useUpdateCoupon } from '@/api/hooks/useAdminCoupons';
import { useAdminUsers } from '@/api/hooks/useAdminUsers';
import type { AdminCoupon } from '@/api/types/admin-coupon.types';
import type { CreateCouponPayload, UpdateCouponPayload } from '@/api/admin-coupon.api';
import { cn } from '@/lib/utils';

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().min(0, 'Value must be positive'),
  max_discount: z.number().min(0).optional(),
  applicable_to: z.enum(['SUBSCRIPTION', 'ADDON', 'BOTH']),
  min_order_value: z.number().min(0).optional(),
  distribution_type: z.enum(['PUBLIC', 'USER_SPECIFIC', 'REFERRAL']),
  assigned_user_ids: z.array(z.string()).optional(),
  usage_limit: z.number().int().min(1, 'Usage limit must be at least 1'),
  per_user_limit: z.number().int().min(1).optional(),
  valid_from: z.string().min(1, 'Valid from is required'),
  valid_until: z.string().min(1, 'Valid until is required'),
  description: z.string().optional(),
}).refine((data) => {
  if (data.type === 'PERCENTAGE' && (data.max_discount === undefined || data.max_discount === null)) {
    return false;
  }
  return true;
}, { message: 'Max discount is required for percentage-based coupons', path: ['max_discount'] });

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  coupon?: AdminCoupon;
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setDebouncedUserSearch(userSearch), 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [userSearch]);

  const { data: usersData } = useAdminUsers({ search: debouncedUserSearch, limit: 20 });
  const users = usersData?.users ?? [];

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          max_discount: coupon.max_discount,
          applicable_to: coupon.applicable_to,
          min_order_value: coupon.min_order_value,
          distribution_type: coupon.distribution_type,
          assigned_user_ids: coupon.assigned_user_ids ?? [],
          usage_limit: coupon.usage_limit,
          per_user_limit: coupon.per_user_limit,
          valid_from: coupon.valid_from ? format(new Date(coupon.valid_from), 'yyyy-MM-dd') : '',
          valid_until: coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy-MM-dd') : '',
          description: coupon.description ?? '',
        }
      : {
          type: 'PERCENTAGE',
          applicable_to: 'BOTH',
          distribution_type: 'PUBLIC',
          usage_limit: 1,
          assigned_user_ids: [],
          value: 0,
        },
  });

  const watchType = form.watch('type');
  const watchDistribution = form.watch('distribution_type');
  const watchAssignedUserIds = form.watch('assigned_user_ids') ?? [];

  const isPercentage = watchType === 'PERCENTAGE';
  const isUserSpecific = watchDistribution === 'USER_SPECIFIC';

  const selectedUsers = useMemo(() => {
    return users.filter((u) => watchAssignedUserIds.includes(u._id));
  }, [users, watchAssignedUserIds]);

  const onSubmit = (data: CouponFormValues) => {
    const payload: CreateCouponPayload | UpdateCouponPayload = {
      ...data,
      max_discount: isPercentage ? data.max_discount : undefined,
      assigned_user_ids: isUserSpecific ? data.assigned_user_ids : undefined,
      per_user_limit: data.per_user_limit,
      min_order_value: data.min_order_value,
      description: data.description,
    };

    if (coupon) {
      updateCoupon.mutate(
        { id: coupon._id, data: payload },
        { onSuccess: () => router.push('/admin/coupons') },
      );
    } else {
      createCoupon.mutate(payload as CreateCouponPayload, {
        onSuccess: () => router.push('/admin/coupons'),
      });
    }
  };

  const isPending = createCoupon.isPending || updateCoupon.isPending;

  const toggleUser = (userId: string) => {
    const current = form.getValues('assigned_user_ids') ?? [];
    if (current.includes(userId)) {
      form.setValue('assigned_user_ids', current.filter((id) => id !== userId), { shouldValidate: true });
    } else {
      form.setValue('assigned_user_ids', [...current, userId], { shouldValidate: true });
    }
  };

  const removeUser = (userId: string) => {
    const current = form.getValues('assigned_user_ids') ?? [];
    form.setValue('assigned_user_ids', current.filter((id) => id !== userId), { shouldValidate: true });
  };

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <TicketPercent className="h-3.5 w-3.5" />
          </span>
          {coupon ? 'Edit Coupon' : 'New Coupon'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Code
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-9" placeholder="e.g. SUMMER20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Value */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Value
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-9"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        placeholder={isPercentage ? 'e.g. 20' : 'e.g. 100'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Discount (conditional) */}
              {isPercentage && (
                <FormField
                  control={form.control}
                  name="max_discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Max Discount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="h-9"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          placeholder="e.g. 500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Applicability */}
              <FormField
                control={form.control}
                name="applicable_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Applicable To
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select applicability" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                        <SelectItem value="ADDON">Add-on</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Distribution Type */}
              <FormField
                control={form.control}
                name="distribution_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Distribution Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Select distribution" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="USER_SPECIFIC">User Specific</SelectItem>
                        <SelectItem value="REFERRAL">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Min Order Value */}
              <FormField
                control={form.control}
                name="min_order_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Min Order Value
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-9"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usage Limit */}
              <FormField
                control={form.control}
                name="usage_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Usage Limit
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-9"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                        placeholder="e.g. 100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Per User Limit */}
              <FormField
                control={form.control}
                name="per_user_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Per User Limit
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-9"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                        placeholder="Optional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valid From */}
              <FormField
                control={form.control}
                name="valid_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Valid From
                    </FormLabel>
                    <FormControl>
                      <Input type="date" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valid Until */}
              <FormField
                control={form.control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Valid Until
                    </FormLabel>
                    <FormControl>
                      <Input type="date" className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Optional description for this coupon" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conditional User Assignment */}
            {isUserSpecific && (
              <div className="space-y-3 rounded-md border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned Users
                </p>

                {/* Selected user chips */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge
                        key={user._id}
                        variant="secondary"
                        className="h-8 gap-1.5 border-0 bg-primary/10 px-2.5 text-xs font-semibold text-primary ring-1 ring-primary/15"
                      >
                        {user.name} ({user.email})
                        <button
                          type="button"
                          onClick={() => removeUser(user._id)}
                          className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-9 pl-9"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                {/* User checkboxes */}
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-md border border-border/60 bg-background p-2">
                  {users.length === 0 && (
                    <p className="px-2 py-3 text-center text-sm text-muted-foreground">No users found.</p>
                  )}
                  {users.map((user) => {
                    const checked = watchAssignedUserIds.includes(user._id);
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => toggleUser(user._id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                          checked ? 'bg-primary/5 ring-1 ring-primary/15' : 'hover:bg-accent/20',
                        )}
                      >
                        <Checkbox checked={checked} className="shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="h-9 gap-1.5">
                <TicketPercent className="h-3.5 w-3.5" />
                {isPending ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => router.push('/admin/coupons')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
