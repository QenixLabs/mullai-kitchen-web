import { z } from "zod";

export const profileFormSchema = z.object({
  dietary_preferences: z.string().trim().optional(),
  special_instructions: z.string().trim().optional(),
  preferred_contact_time: z.string().trim().optional(),
  emergency_contact_name: z.string().trim().optional(),
  emergency_contact_phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\+?[0-9\s-]{10,15}$/.test(value),
      "Please enter a valid emergency phone number.",
    ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
