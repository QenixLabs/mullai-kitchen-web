import { z } from 'zod';

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
    duration_weeks: z.coerce.number().int().min(1).max(52),
    headcount: z.coerce.number().int().min(1, 'Enter headcount'),
    veg_count: z.coerce.number().int().min(0),
    nonveg_count: z.coerce.number().int().min(0),
    notes: z.string().optional(),
  })
  .refine((data) => data.veg_count + data.nonveg_count === data.headcount, {
    message: 'Veg + Non-veg count must equal total headcount',
    path: ['veg_count'],
  });

export type CreateCorporateOrderFormData = z.infer<typeof createCorporateOrderSchema>;

export const modifyCorporateOrderSchema = z.object({
  modification_date: z.string().min(1, 'Select a date'),
  veg_reduction: z.coerce.number().int().min(0),
  nonveg_reduction: z.coerce.number().int().min(0),
  reason: z.string().optional(),
}).refine((data) => data.veg_reduction + data.nonveg_reduction > 0, {
  message: 'Specify at least 1 meal to reduce',
  path: ['veg_reduction'],
});

export type ModifyCorporateOrderFormData = z.infer<typeof modifyCorporateOrderSchema>;
