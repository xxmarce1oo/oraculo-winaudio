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

export const authService = {
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    const supabase = createSupabaseBrowserClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: 'E-mail ou senha incorretos. Tente novamente.' };
    }

    return { 
      user: data.user ? { id: data.user.id, email: data.user.email } : null, 
      error: null 
    };
  },

  async logout(): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ? { id: user.id, email: user.email } : null;
  },

  async getUserProfile(): Promise<UserProfile | null> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role, department_id')
      .eq('id', user.id)
      .single();

    return profile ? {
      id: user.id,
      email: user.email,
      role: profile.role || 'funcionario',
      full_name: profile.full_name,
      department_id: profile.department_id,
    } : null;
  },

  async isAdmin(): Promise<boolean> {
    const profile = await this.getUserProfile();
    // admin_global tem acesso total, gestor_setor tem acesso administrativo limitado
    return profile?.role === 'admin_global' || profile?.role === 'gestor_setor';
  },

  async isGlobalAdmin(): Promise<boolean> {
    const profile = await this.getUserProfile();
    return profile?.role === 'admin_global';
  },
};
