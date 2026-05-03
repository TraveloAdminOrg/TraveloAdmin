import { z } from "zod";
import { REGION_CODES } from "../lib/regions";

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
  allowedRegions: z
    .array(z.enum(REGION_CODES as [string, ...string[]]))
    .min(1, "Select at least one region"),
  isActive: z.boolean(),
  icon: z.string().trim().optional().or(z.literal("")),
});

export type RideTypeFormInput = z.infer<typeof rideTypeFormSchema>;
