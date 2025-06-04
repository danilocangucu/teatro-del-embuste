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
  reservationId: z.string().uuid("Invalid reservation ID"),
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
  reservationId: z.string().uuid("Invalid reservation ID"),
  // TODO other fields specific to non-guests
});

export const UserRegistrationSchema = z.discriminatedUnion("isGuest", [
  GuestUserRegistrationSchema,
  NonGuestUserRegistrationSchema,
]);
