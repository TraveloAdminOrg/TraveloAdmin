import { z } from "zod";

export const QUESTION_MAX_LENGTH = 200;
export const ANSWER_MAX_LENGTH = 2000;

export const faqFormSchema = z.object({
  question: z
    .string({ message: "Question is required" })
    .trim()
    .min(5, "Question must be at least 5 characters")
    .max(QUESTION_MAX_LENGTH, "Question is too long"),
  answer: z
    .string({ message: "Answer is required" })
    .trim()
    .min(5, "Answer must be at least 5 characters")
    .max(ANSWER_MAX_LENGTH, "Answer is too long"),
  order: z
    .number({ message: "Order is required" })
    .int("Order must be a whole number")
    .min(0, "Order cannot be negative")
    .max(9999, "Order is too large"),
});

export type FaqFormInput = z.infer<typeof faqFormSchema>;
