'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCreatePlan, useUpdatePlan } from '@/api/hooks/usePlans';
import { PlanDuration, PlanStatus, PlanType, MealType } from '@/api/types/admin-subscription.types';
import type { Plan } from '@/api/types/admin-subscription.types';

const mealOptions = [
  { value: MealType.BREAKFAST, label: 'Breakfast' },
  { value: MealType.LUNCH, label: 'Lunch' },
  { value: MealType.DINNER, label: 'Dinner' },
];

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  duration: z.nativeEnum(PlanDuration),
  meals_included: z.array(z.nativeEnum(MealType)).min(1, 'At least one meal is required'),
  price: z.number().min(0, 'Price must be positive'),
  status: z.nativeEnum(PlanStatus).optional(),
  outlet_restriction: z.string().optional(),
  valid_from: z.string().min(1, 'Valid from date is required'),
  valid_until: z.string().optional(),
  max_subscribers: z.number().int().min(0).optional(),
  plan_type: z.nativeEnum(PlanType).optional(),
  veg_price: z.number().min(0).optional(),
  nonveg_price: z.number().min(0).optional(),
  uses_outlet_pricing: z.boolean().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  plan?: Plan;
}

export function PlanForm({ plan }: PlanFormProps) {
  const router = useRouter();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const [usesOutletPricing, setUsesOutletPricing] = useState(plan?.uses_outlet_pricing ?? false);

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? {
      name: plan.name,
      description: plan.description || '',
      duration: plan.duration,
      meals_included: plan.meals_included,
      price: plan.price,
      status: plan.status,
      outlet_restriction: plan.outlet_restriction || undefined,
      valid_from: plan.valid_from ? new Date(plan.valid_from).toISOString().split('T')[0] : '',
      valid_until: plan.valid_until ? new Date(plan.valid_until).toISOString().split('T')[0] : '',
      max_subscribers: plan.max_subscribers,
      plan_type: plan.plan_type,
      veg_price: plan.veg_price,
      nonveg_price: plan.nonveg_price,
      uses_outlet_pricing: plan.uses_outlet_pricing,
    } : {
      meals_included: [],
      price: 0,
      uses_outlet_pricing: false,
    },
  });

  const onSubmit = (data: PlanFormValues) => {
    if (plan) {
      updatePlan.mutate(
        { id: plan._id, data },
        { onSuccess: () => router.push('/admin/plans') },
      );
    } else {
      createPlan.mutate(
        data as any,
        { onSuccess: () => router.push('/admin/plans') },
      );
    }
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan ? 'Edit Plan' : 'New Plan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={PlanDuration.WEEKLY}>Weekly</SelectItem>
                      <SelectItem value={PlanDuration.MONTHLY}>Monthly</SelectItem>
                      <SelectItem value={PlanDuration.QUARTERLY}>Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="meals_included" render={() => (
              <FormItem>
                <FormLabel>Meals Included</FormLabel>
                <div className="flex gap-4">
                  {mealOptions.map((meal) => (
                    <FormField key={meal.value} control={form.control} name="meals_included" render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(meal.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              field.onChange(checked ? [...current, meal.value] : current.filter((v: MealType) => v !== meal.value));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">{meal.label}</FormLabel>
                      </FormItem>
                    )} />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex items-center gap-3">
              <Switch
                checked={usesOutletPricing}
                onCheckedChange={(checked) => { setUsesOutletPricing(checked); form.setValue('uses_outlet_pricing', checked); }}
              />
              <Label>Uses Outlet Pricing</Label>
            </div>

            {!usesOutletPricing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Base Price (₹)</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="veg_price" render={({ field }) => (
                  <FormItem><FormLabel>Veg Price (₹)</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="nonveg_price" render={({ field }) => (
                  <FormItem><FormLabel>Non-Veg Price (₹)</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="valid_from" render={({ field }) => (
                <FormItem><FormLabel>Valid From</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="valid_until" render={({ field }) => (
                <FormItem><FormLabel>Valid Until</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="max_subscribers" render={({ field }) => (
                <FormItem><FormLabel>Max Subscribers</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
              )} />
              {plan && (
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value={PlanStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={PlanStatus.PUBLISHED}>Published</SelectItem>
                        <SelectItem value={PlanStatus.ARCHIVED}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/plans')}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
