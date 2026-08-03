import { z } from "zod";

const moneyField = (field: string) =>
  z
    .number({ message: `${field} is required` })
    .min(0, `${field} cannot be negative`)
    .max(1_000_000, `${field} is too large`);

export const weeklyFareEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  baseFare: moneyField("Base fare"),
  pricePerKm: moneyField("Price per km"),
  pricePerMinute: moneyField("Price per minute"),
  minimumFare: moneyField("Minimum fare"),
  cancellationFee: moneyField("Cancellation fee"),
  cleaningCharge: moneyField("Cleaning charge"),
  waitingCharge: moneyField("Waiting charge"),
  // The fare is multiplied by this, so 1 is "no surge" and anything below 1
  // would discount (0 would make the ride free). Not a money field.
  surgeMultiplier: z
    .number({ message: "Surge multiplier is required" })
    .min(1, "Surge cannot be below 1×")
    .max(10, "Surge cannot exceed 10×"),
});

export const pricingFormSchema = z.object({
  region: z.string({ message: "Select a region" }).min(1, "Select a region"),
  rideType: z
    .string({ message: "Select a ride type" })
    .min(1, "Select a ride type"),
  weeklyFare: z
    .array(weeklyFareEntrySchema)
    .length(7, "Weekly fare must have one entry per day")
    .refine(
      (entries) => {
        const days = entries.map((e) => e.dayOfWeek).sort((a, b) => a - b);
        return days.every((d, i) => d === i);
      },
      { message: "Weekly fare must cover days 0–6 exactly once each" },
    ),
});

export type PricingFormInput = z.infer<typeof pricingFormSchema>;
