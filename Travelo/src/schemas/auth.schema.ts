import { z } from "zod";

// RFC 5322-ish practical email regex.
// Catches typos like "a@b" while allowing valid emails like "first.last+tag@sub.example.co.uk".
export const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$/;

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254; // RFC 5321

export const signInSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .max(EMAIL_MAX_LENGTH, "Email is too long")
    .regex(EMAIL_REGEX, "Enter a valid email address"),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required")
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    )
    .max(PASSWORD_MAX_LENGTH, "Password is too long"),
});

export type SignInInput = z.infer<typeof signInSchema>;
