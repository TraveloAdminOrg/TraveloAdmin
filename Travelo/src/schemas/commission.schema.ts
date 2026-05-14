import { z } from "zod";

export const COMMISSION_TYPES = ["percentage", "fixed"] as const;
export const BOOKING_TYPES = [
  "auto_accept",
  "scheduled_ride",
  "bid_for_ride",
] as const;

// Single commission row, with a cross-field rule: percentages must be 0–100,
// fixed amounts must be 0+ and not silly-large.
export const commissionEntrySchema = z
  .object({
    rideType: z
      .string({ message: "Select a ride type" })
      .min(1, "Select a ride type"),
    bookingType: z.enum(BOOKING_TYPES, {
      message: "Select a booking type",
    }),
    commissionType: z.enum(COMMISSION_TYPES, {
      message: "Select a commission type",
    }),
    commission: z
      .number({ message: "Commission value is required" })
      .min(0, "Commission cannot be negative"),
  })
  .superRefine((data, ctx) => {
    if (data.commissionType === "percentage" && data.commission > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commission"],
        message: "Percentage cannot exceed 100",
      });
    }
    if (data.commissionType === "fixed" && data.commission > 1_000_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commission"],
        message: "Fixed amount is too large",
      });
    }
  });

export const commissionFormSchema = z
  .object({
    region: z.string({ message: "Select a region" }).min(1, "Select a region"),
    commissions: z
      .array(commissionEntrySchema)
      .min(1, "Add at least one commission"),
  })
  .refine(
    (data) => {
      // Same rideType + bookingType combination shouldn't repeat — otherwise
      // there are two competing commission rules for the same ride flow.
      const seen = new Set<string>();
      for (const c of data.commissions) {
        const key = `${c.rideType}|${c.bookingType}`;
        if (seen.has(key)) return false;
        seen.add(key);
      }
      return true;
    },
    {
      message:
        "Each ride type + booking type combination can only appear once",
      path: ["commissions"],
    },
  );

export type CommissionFormInput = z.infer<typeof commissionFormSchema>;
