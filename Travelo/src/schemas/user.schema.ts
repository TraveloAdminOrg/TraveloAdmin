import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone").optional().or(z.literal("")),
  status: z.enum(["active", "blocked", "pending"]).optional(),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
