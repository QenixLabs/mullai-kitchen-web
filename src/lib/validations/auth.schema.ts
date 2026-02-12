import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const pincodeSchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/, "Please enter a valid 6-digit pincode."),
});

export type PincodeFormData = z.infer<typeof pincodeSchema>;
