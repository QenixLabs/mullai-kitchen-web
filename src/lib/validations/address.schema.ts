import { z } from "zod";

export const addressFormSchema = z.object({
  type: z.enum(["Home", "Office", "Other"]),
  flat_house_no: z.string().trim().optional(),
  floor: z.string().trim().optional(),
  full_address: z
    .string()
    .trim()
    .optional(),
  area: z.string().trim().min(2, "Area is required."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be a valid 6-digit number."),
  city: z.string().trim().min(2, "City is required."),
  state: z.string().trim().min(2, "State is required."),
  landmark: z.string().trim().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;
