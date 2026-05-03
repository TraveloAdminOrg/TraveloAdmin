import { z } from "zod";
import { REGION_CODES } from "../lib/regions";

const moneyField = (field: string) =>
  z
    .number({ message: `${field} is required` })
    .min(0, `${field} cannot be negative`)
    .max(1_000_000, `${field} is too large`);

export const pricingRideTypeSchema = z.object({
  rideType: z.string({ message: "Select a ride type" }).min(1, "Select a ride type"),
  baseFare: moneyField("Base fare"),
  pricePerKm: moneyField("Price per km"),
  pricePerMinute: moneyField("Price per minute"),
  minimumFare: moneyField("Minimum fare"),
  cancellationFee: moneyField("Cancellation fee"),
});

export const pricingFormSchema = z
  .object({
    countryCode: z.enum(REGION_CODES as [string, ...string[]]),
    currency: z
      .string({ message: "Currency is required" })
      .trim()
      .min(2, "Use a currency code (e.g. PKR)")
      .max(8, "Currency code is too long"),
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

export type PricingFormInput = z.infer<typeof pricingFormSchema>;
