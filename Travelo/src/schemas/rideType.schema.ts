import { z } from "zod";

export const TITLE_MAX_LENGTH = 50;
export const PASSENGERS_MIN = 1;
export const PASSENGERS_MAX = 50;

export const rideTypeFormSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(TITLE_MAX_LENGTH, "Title is too long"),
  passengers: z
    .number({ message: "Enter a number" })
    .int("Must be a whole number")
    .min(PASSENGERS_MIN, `At least ${PASSENGERS_MIN} passenger`)
    .max(PASSENGERS_MAX, "Too many passengers"),
  // Region _ids the ride type is enabled for.
  allowedRegions: z
    .array(z.string().min(1))
    .min(1, "Select at least one region"),
  isActive: z.boolean(),
  // Empty string means "use the default icon"; otherwise it must be a valid URL.
  icon: z
    .union([z.literal(""), z.string().trim().url("Enter a valid icon URL")])
    .optional(),
});

export type RideTypeFormInput = z.infer<typeof rideTypeFormSchema>;
