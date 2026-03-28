import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { UserProfile, CreateUserData, UpdateUserData } from '@/types';

export const usersService = {
  async getAll(): Promise<{ data: UserProfile[]; error: string | null }> {
    try {
      const response = await fetch('/api/users');
      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao buscar usuários:', result.error);
        return { data: [], error: result.error || 'Erro ao buscar usuários' };
      }

      return { data: (result.users as UserProfile[]) || [], error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { data: [], error: 'Erro inesperado ao buscar usuários' };
    }
  },

  async getById(id: string): Promise<{ data: UserProfile | null; error: string | null }> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          department_id,
          created_at,
          departments ( id, name )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return { data: null, error: 'Erro ao buscar usuário' };
      }

      return { data: data as UserProfile, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { data: null, error: 'Erro inesperado ao buscar usuário' };
    }
  },

  async create(userData: CreateUserData): Promise<{ success: boolean; error: string | null }> {
    try {
      // Criar usuário via API route (precisa de service_role key)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erro ao criar usuário' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao criar usuário' };
    }
  },

  async update(id: string, userData: UpdateUserData): Promise<{ success: boolean; error: string | null }> {
    try {
      // Usar API route com service_role key para bypass de RLS
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...userData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao atualizar usuário:', result.error);
        return { success: false, error: result.error || 'Erro ao atualizar usuário' };
      }

      console.log('Perfil atualizado:', result.data);
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao atualizar usuário' };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Deletar usuário via API route (precisa de service_role key)
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Erro ao excluir usuário' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao excluir usuário' };
    }
  },
};
