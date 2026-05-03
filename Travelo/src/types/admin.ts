// The currently-logged-in admin user (distinct from end-user / rider).
export interface Admin {
  _id: string;
  email: string;
  image?: string;
  type: string; // e.g. "super_admin" | "admin" | "manager"
  permissions: string[];
  isBlocked: boolean;
  isDeleted: boolean;
  isActive: boolean;
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}
