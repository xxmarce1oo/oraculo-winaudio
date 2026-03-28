import type { Department } from '@/types';

export const departmentsService = {
  async getAll(): Promise<{ data: Department[]; error: string | null }> {
    try {
      const response = await fetch('/api/departments');
      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao buscar departamentos:', result.error);
        return { data: [], error: result.error || 'Erro ao buscar departamentos' };
      }

      return { data: result.departments || [], error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { data: [], error: 'Erro inesperado ao buscar departamentos' };
    }
  },

  async create(name: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao criar departamento:', result.error);
        return { success: false, error: result.error || 'Erro ao criar departamento' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao criar departamento' };
    }
  },

  async update(id: string, name: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao atualizar departamento:', result.error);
        return { success: false, error: result.error || 'Erro ao atualizar departamento' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao atualizar departamento' };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const response = await fetch(`/api/departments?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao excluir departamento:', result.error);
        return { success: false, error: result.error || 'Erro ao excluir departamento' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao excluir departamento' };
    }
  },
};
