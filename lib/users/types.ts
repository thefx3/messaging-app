export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export const ROLE_OPTIONS: UserRole[] = ["USER", "ADMIN", "SUPER_ADMIN"];

export type UserProfileRow = {
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
};
