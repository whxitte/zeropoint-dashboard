export interface User {
  user_id: string;
  tenant_id: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
}
