import { z } from 'zod';

export const BILLING_CYCLE_OPTIONS = [
  { days: 7, label: 'Weekly' },
  { days: 30, label: 'Monthly' },
  { days: 90, label: 'Quarterly' },
] as const;

export type BillingCycleDays = 7 | 30 | 90;

export const createCorporateOrderSchema = z
  .object({
    delivery_address: z.object({
      address_line: z.string().min(5, 'Address line is required'),
      area: z.string().min(2, 'Area is required'),
      landmark: z.string().optional(),
      pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
    selected_days: z
      .array(z.string())
      .min(1, 'Select at least one day'),
    meal_types: z
      .array(z.string())
      .min(1, 'Select at least one meal type'),
    start_date: z.string().min(1, 'Select a start date'),
    end_date: z.string().optional(),
    billing_cycle_days: z.coerce
      .number()
      .int()
      .refine((val) => [7, 30, 90].includes(val), {
        message: 'Select a billing cycle',
      }),
    headcount: z.coerce.number().int().min(1, 'Enter headcount'),
    veg_count: z.coerce.number().int().min(0),
    nonveg_count: z.coerce.number().int().min(0),
    notes: z.string().optional(),
  })
  .refine((data) => data.veg_count + data.nonveg_count === data.headcount, {
    message: 'Veg + Non-veg count must equal total headcount',
    path: ['veg_count'],
  })
  .refine((data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) > new Date(data.start_date);
    }
    return true;
  }, {
    message: 'End date must be after start date',
    path: ['end_date'],
  });

export type CreateCorporateOrderFormData = z.infer<typeof createCorporateOrderSchema>;

export const modifyCorporateOrderSchema = z.object({
  modification_date: z.string().min(1, 'Select a date'),
  veg_change: z.coerce.number().int(),
  nonveg_change: z.coerce.number().int(),
  reason: z.string().optional(),
}).refine((data) => Math.abs(data.veg_change) + Math.abs(data.nonveg_change) > 0, {
  message: 'Specify at least 1 meal to change',
  path: ['veg_change'],
});

export type ModifyCorporateOrderFormData = z.infer<typeof modifyCorporateOrderSchema>;
