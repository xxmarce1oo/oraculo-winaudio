export type UserRole = 'admin_global' | 'gestor_setor' | 'funcionario';

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  department_id: string | null;
  created_at: string;
  departments?: { id: string; name: string }[] | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  department_id: string | null;
}

export interface UpdateUserData {
  full_name?: string;
  role?: UserRole;
  department_id?: string | null;
}
