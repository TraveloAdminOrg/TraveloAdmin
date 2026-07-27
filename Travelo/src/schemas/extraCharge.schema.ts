import { z } from "zod";

export const EXTRA_CHARGE_CODES = [
  "parking_fee",
  "congestion_charge",
  "airport_fee",
  "toll_charge",
  "cleaning_fee",
  "pet_charge",
] as const;

export const EXTRA_CHARGE_LABELS: Record<
  (typeof EXTRA_CHARGE_CODES)[number],
  string
> = {
  parking_fee: "Parking Fee",
  congestion_charge: "Congestion Charge",
  airport_fee: "Airport Fee",
  toll_charge: "Toll Charge",
  cleaning_fee: "Cleaning Fee",
  pet_charge: "Pet Charge",
};

// Per-row helper copy shown under each charge in the form.
export const EXTRA_CHARGE_HINTS: Partial<
  Record<(typeof EXTRA_CHARGE_CODES)[number], string>
> = {
  toll_charge:
    "Fixed finish-screen toll. Drivers can still enter exact tolls mid-ride; a ride can only carry one of the two.",
  cleaning_fee:
    "Fixed finish-screen cleaning fee. The mid-ride cleaning toggle (priced by the fare rate card) still works; a ride can only carry one of the two.",
  pet_charge:
    "Auto-applied at ride completion when the trip was booked with pets; never shown to drivers.",
};

// A charge may be saved disabled with any amount (including 0), but enabling
// it requires a positive amount — an active £0 charge would be meaningless
// and the backend refuses to offer it to drivers anyway.
export const extraChargeEntrySchema = z
  .object({
    code: z.enum(EXTRA_CHARGE_CODES),
    amount: z
      .number({ message: "Amount is required" })
      .min(0, "Amount cannot be negative"),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.isActive && !(data.amount > 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Set an amount to enable this charge",
      });
    }
  });

export const extraChargeFormSchema = z.object({
  region: z.string({ message: "Select a region" }).min(1, "Select a region"),
  charges: z
    .array(extraChargeEntrySchema)
    .length(
      EXTRA_CHARGE_CODES.length,
      "Every predefined charge needs a row",
    ),
});

export type ExtraChargeFormInput = z.infer<typeof extraChargeFormSchema>;
