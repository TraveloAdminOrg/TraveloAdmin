import { z } from "zod";

export const driverFormSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone"),
  licenseNumber: z.string().min(3, "License number is required"),
  vehicleId: z.string().optional(),
  status: z
    .enum(["online", "offline", "on_ride", "blocked", "pending_approval"])
    .optional(),
});

export type DriverFormInput = z.infer<typeof driverFormSchema>;
