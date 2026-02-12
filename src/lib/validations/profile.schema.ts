import { z } from "zod";

export const profileFormSchema = z.object({
  dietary_preferences: z.union([z.literal(""), z.enum(["Veg", "Non-Veg"])]).optional(),
  special_instructions: z.string().trim().optional(),
  preferred_contact_time: z.string().trim().optional(),
  emergency_contact_name: z.string().trim().optional(),
  emergency_contact_phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d{10}$/.test(value),
      "Please enter a valid 10-digit phone number.",
    ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
