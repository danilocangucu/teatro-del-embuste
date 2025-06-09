import { z } from "zod";

export const GuestUserRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?[\d\s()-]{7,20}$/.test(val), {
      message: "Invalid phone number format",
    }),
  isGuest: z.literal(true),
  showSlug: z
    .string()
    .min(1, "Show slug is required")
    .regex(
      /^[a-z]+(?:-[a-z]+)*$/,
      "Invalid show slug. Use lowercase letters and hyphens only."
    ),
  performanceSlug: z
    .string()
    .min(1, "Performance slug is required")
    .regex(
      /^\d{2}-\d{2}-\d{2}-(1[0-2]|0?[1-9])(AM|PM)$/,
      "Invalid performance slug. Use format DD-MM-YY-HH(AM|PM), e.g., 30-06-25-8PM"
    ),
});

export const NonGuestUserRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[+]?[\d\s()-]{7,20}$/.test(val), {
      message: "Invalid phone number format",
    }),
  isGuest: z.literal(false),
  showSlug: z
    .string()
    .min(1, "Show slug is required")
    .regex(
      /^[a-z]+(?:-[a-z]+)*$/,
      "Invalid show slug. Use lowercase letters and hyphens only."
    ),
  performanceSlug: z
    .string()
    .min(1, "Performance slug is required")
    .regex(
      /^\d{2}-\d{2}-\d{2}-(1[0-2]|0?[1-9])(AM|PM)$/,
      "Invalid performance slug. Use format DD-MM-YY-HH(AM|PM), e.g., 30-06-25-8PM"
    ),
  // Additional fields for non-guest users
});

export const UserRegistrationSchema = z.discriminatedUnion("isGuest", [
  GuestUserRegistrationSchema,
  NonGuestUserRegistrationSchema,
]);
