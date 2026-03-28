import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Rule, RuleFormData } from '@/types';

export const rulesService = {
  async getAll(): Promise<{ data: Rule[]; error: string | null }> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('rules')
        .select(`
          id, 
          title, 
          content,
          type, 
          department_id, 
          created_at,
          departments ( id, name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar normas:', error);
        return { data: [], error: 'Erro ao buscar normas' };
      }

      return { data: (data as Rule[]) || [], error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { data: [], error: 'Erro inesperado ao buscar normas' };
    }
  },

  async getById(id: string): Promise<{ data: Rule | null; error: string | null }> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('rules')
        .select(`
          id, 
          title, 
          content,
          type, 
          department_id, 
          created_at,
          departments ( id, name )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar norma:', error);
        return { data: null, error: 'Erro ao buscar norma' };
      }

      return { data: data as Rule, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { data: null, error: 'Erro inesperado ao buscar norma' };
    }
  },

  async create(ruleData: RuleFormData): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createSupabaseBrowserClient();
      
      // 1. Inserimos e pedimos para o Supabase devolver o ID gerado (.select('id').single())
      const { data, error } = await supabase
        .from('rules')
        .insert([ruleData])
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao salvar:', error);
        return { success: false, error: 'Erro ao salvar a normativa' };
      }

      // 2. Com a regra salva, disparamos a vetorização na IA em segundo plano
      if (data && data.id) {
        fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ruleId: data.id,
            content: ruleData.content
          })
        }).catch(err => console.error('Erro ao chamar API de embeddings:', err));
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao salvar' };
    }
  },

  async update(id: string, ruleData: Partial<RuleFormData>): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('rules')
        .update(ruleData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar:', error);
        return { success: false, error: 'Erro ao atualizar a normativa' };
      }

      // Se o texto (content) foi atualizado, precisamos gerar um NOVO vetor
      if (ruleData.content) {
        fetch('/api/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ruleId: id,
            content: ruleData.content
          })
        }).catch(err => console.error('Erro ao atualizar API de embeddings:', err));
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao atualizar' };
    }
  },

  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('rules').delete().eq('id', id);

      if (error) {
        console.error('Erro ao excluir:', error);
        return { success: false, error: 'Não foi possível excluir a normativa' };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro inesperado:', error);
      return { success: false, error: 'Erro inesperado ao excluir' };
    }
  },
};