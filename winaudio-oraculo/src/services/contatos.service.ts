import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export interface Contato {
  id: string;
  nome: string;
  setor: string;
  telefones: string[];
  emails: string[];
  descricao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export type ContatoFormData = Omit<Contato, 'id' | 'criado_em' | 'atualizado_em'>;

export const contatosService = {
  async getAll(search?: string): Promise<{ data: Contato[]; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    let query = supabase
      .from('contatos')
      .select('*')
      .order('nome', { ascending: true });

    if (search) {
      query = query.ilike('nome', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) return { data: [], error: 'Erro ao buscar contatos' };
    return { data: data as Contato[], error: null };
  },

  async create(form: ContatoFormData): Promise<{ success: boolean; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('contatos').insert({ ...form, criado_por: user?.id ?? null });
    if (error) return { success: false, error: 'Erro ao criar contato' };
    return { success: true, error: null };
  },

  async update(id: string, form: ContatoFormData): Promise<{ success: boolean; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('contatos')
      .update({ ...form, atualizado_em: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: 'Erro ao atualizar contato' };
    return { success: true, error: null };
  },

  async delete(id: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('contatos').delete().eq('id', id);
    if (error) return { success: false, error: 'Erro ao excluir contato' };
    return { success: true, error: null };
  },
};
