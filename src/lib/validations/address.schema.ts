import { z } from "zod";

export const addressFormSchema = z.object({
  type: z.enum(["Home", "Office"]),
  full_address: z
    .string()
    .trim()
    .min(10, "Please enter at least 10 characters for full address."),
  area: z.string().trim().min(2, "Area is required."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be a valid 6-digit number."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  landmark: z.string().trim().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;
