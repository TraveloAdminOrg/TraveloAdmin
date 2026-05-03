import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(2, "Role name is too short"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

export type RoleFormInput = z.infer<typeof roleFormSchema>;
