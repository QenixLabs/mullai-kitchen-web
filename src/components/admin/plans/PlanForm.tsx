'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
import { ImageUploadField } from './ImageUploadField';
import { PlanDuration, PlanStatus, MealType } from '@/api/types/admin-subscription.types';
import type { Plan } from '@/api/types/admin-subscription.types';

const mealOptions = [
  { value: MealType.BREAKFAST, label: 'Breakfast' },
  { value: MealType.LUNCH, label: 'Lunch' },
  { value: MealType.DINNER, label: 'Dinner' },
];

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  image_url: z.string().optional(),
  duration: z.nativeEnum(PlanDuration),
  meals_included: z.array(z.nativeEnum(MealType)).min(1, 'At least one meal is required'),
  price: z.number().min(0, 'Price must be positive'),
  status: z.nativeEnum(PlanStatus).optional(),
  outlet_restriction: z.string().optional(),
  valid_from: z.string().min(1, 'Valid from date is required'),
  valid_until: z.string().optional(),
  max_subscribers: z.number().int().min(0).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  plan?: Plan;
}

export function PlanForm({ plan }: PlanFormProps) {
  const router = useRouter();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const form = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? {
      name: plan.name,
      description: plan.description || '',
      image_url: plan.image_url || '',
      duration: plan.duration,
      meals_included: plan.meals_included,
      price: plan.price,
      status: plan.status,
      outlet_restriction: plan.outlet_restriction || undefined,
      valid_from: plan.valid_from ? new Date(plan.valid_from).toISOString().split('T')[0] : '',
      valid_until: plan.valid_until ? new Date(plan.valid_until).toISOString().split('T')[0] : '',
      max_subscribers: plan.max_subscribers,
    } : {
      meals_included: [],
      price: 0,
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
        data,
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g. Monthly Veg Plan" /></FormControl>
                  <FormMessage />
                </FormItem>
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
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea {...field} placeholder="Describe what this plan includes..." rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Image Upload */}
            <div className="space-y-3">
              <FormField control={form.control} name="image_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Image</FormLabel>
                  <FormControl>
                    <ImageUploadField value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Meals & Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Meals & Pricing</h3>
              <FormField control={form.control} name="meals_included" render={() => (
                <FormItem>
                  <FormLabel>Meals Included</FormLabel>
                  <div className="flex flex-wrap gap-6">
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

              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Validity */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Validity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="valid_from" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="valid_until" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Limits & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="max_subscribers" render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Subscribers</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                      placeholder="Unlimited"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="min-w-[120px]">
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
