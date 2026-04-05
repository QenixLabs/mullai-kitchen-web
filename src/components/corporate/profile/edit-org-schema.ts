import { z } from "zod";

export const editProfileSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  gst_number: z.string().optional().or(z.literal("")),
  pan_number: z.string().optional().or(z.literal("")),
  delegate_name: z.string().min(1, "Delegate name is required"),
  delegate_designation: z.string().optional().or(z.literal("")),
  delegate_phone: z.string().optional().or(z.literal("")),
  delegate_email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Invalid email address",
    }),
  street_address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  area_landmark: z.string().optional().or(z.literal("")),
  state_country: z.string().optional().or(z.literal("")),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
