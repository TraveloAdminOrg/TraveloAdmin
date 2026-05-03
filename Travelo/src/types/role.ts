// TODO: Align with your backend Role / Permission entities.
export interface Permission {
  key: string;
  label: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type RoleCreateInput = Omit<Role, "id" | "createdAt" | "updatedAt">;
export type RoleUpdateInput = Partial<RoleCreateInput>;
