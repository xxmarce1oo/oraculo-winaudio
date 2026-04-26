import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface UserProfile {
  id: string;
  email?: string;
  role: string;
  full_name?: string;
  department_id?: string;
}

const supabase = createSupabaseBrowserClient();

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, error: 'E-mail ou senha incorretos. Tente novamente.' };
    }

    return {
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      error: null,
    };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ? { id: session.user.id, email: session.user.email } : null;
  },

  async getUserProfile(): Promise<UserProfile | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, department_id')
      .eq('id', session.user.id)
      .single();

    return profile ? {
      id: session.user.id,
      email: session.user.email,
      role: profile.role || 'funcionario',
      full_name: profile.full_name,
      department_id: profile.department_id,
    } : null;
  },

  async isAdmin(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.role === 'admin_global' || profile?.role === 'gestor_setor';
  },

  async isGlobalAdmin(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.role === 'admin_global';
  },
};
