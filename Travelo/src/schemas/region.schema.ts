import { z } from "zod";

export const COUNTRY_MAX_LENGTH = 60;

export const regionFormSchema = z.object({
  country: z
    .string({ message: "Country is required" })
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(COUNTRY_MAX_LENGTH, "Country name is too long"),
  // ISO-style country code, e.g. PK, GB, MT. Stored uppercase.
  code: z
    .string({ message: "Code is required" })
    .trim()
    .min(2, "Code must be 2–3 letters")
    .max(3, "Code must be 2–3 letters")
    .regex(/^[A-Za-z]+$/, "Code must contain letters only"),
  // ISO 4217 currency code, e.g. PKR, GBP, EUR. Stored uppercase.
  currency: z
    .string({ message: "Currency is required" })
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .regex(/^[A-Za-z]+$/, "Currency must contain letters only"),
  isActive: z.boolean(),
});

export type RegionFormInput = z.infer<typeof regionFormSchema>;
