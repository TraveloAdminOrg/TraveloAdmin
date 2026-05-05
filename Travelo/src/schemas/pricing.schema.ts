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
});

export const pricingRideTypeSchema = z.object({
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

export const pricingFormSchema = z
  .object({
    region: z.string({ message: "Select a region" }).min(1, "Select a region"),
    rideTypes: z
      .array(pricingRideTypeSchema)
      .min(1, "Add at least one ride type"),
  })
  .refine(
    (data) => {
      const ids = data.rideTypes.map((r) => r.rideType);
      return new Set(ids).size === ids.length;
    },
    {
      message: "Each ride type can only appear once",
      path: ["rideTypes"],
    },
  );

export type WeeklyFareEntryInput = z.infer<typeof weeklyFareEntrySchema>;
export type PricingFormInput = z.infer<typeof pricingFormSchema>;
