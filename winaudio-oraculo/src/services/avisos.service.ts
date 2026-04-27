import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  criado_por?: string | null;
  criado_em: string;
  fixado: boolean;
  ativo: boolean;
  autor?: { full_name: string | null } | null;
}

export const avisosService = {
  async getAll(): Promise<{ data: Aviso[]; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .eq('ativo', true)
      .order('fixado', { ascending: false })
      .order('criado_em', { ascending: false });
    if (error) return { data: [], error: 'Erro ao buscar avisos' };

    const avisos = data as Aviso[];

    // Busca nomes dos autores
    const autorIds = [...new Set(avisos.map(a => a.criado_por).filter(Boolean))] as string[];
    if (autorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', autorIds);

      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      avisos.forEach(a => {
        if (a.criado_por) a.autor = profileMap.get(a.criado_por) ?? null;
      });
    }

    return { data: avisos, error: null };
  },

  async countUnread(): Promise<number> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Busca IDs dos avisos que o usuário já leu
    const { data: lidos } = await supabase
      .from('aviso_readings')
      .select('aviso_id')
      .eq('user_id', user.id);

    const lidosIds = (lidos ?? []).map((r: any) => r.aviso_id);

    // Conta avisos ativos não lidos
    let query = supabase.from('avisos').select('id', { count: 'exact', head: true }).eq('ativo', true);
    if (lidosIds.length > 0) {
      query = query.not('id', 'in', `(${lidosIds.join(',')})`);
    }

    const { count } = await query;
    return count ?? 0;
  },

  async markRead(avisoId: string): Promise<void> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('aviso_readings').upsert({ aviso_id: avisoId, user_id: user.id });
  },

  async getReadIds(): Promise<string[]> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase.from('aviso_readings').select('aviso_id').eq('user_id', user.id);
    return (data ?? []).map((r: any) => r.aviso_id);
  },

  async create(aviso: { titulo: string; conteudo: string; fixado?: boolean }): Promise<{ success: boolean; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('avisos').insert({
      ...aviso,
      criado_por: user?.id ?? null,
    });
    if (error) return { success: false, error: 'Erro ao criar aviso' };
    return { success: true, error: null };
  },

  async archive(id: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('avisos').update({ ativo: false }).eq('id', id);
    if (error) return { success: false, error: 'Erro ao arquivar aviso' };
    return { success: true, error: null };
  },

  async toggleFixado(id: string, fixado: boolean): Promise<{ success: boolean; error: string | null }> {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('avisos').update({ fixado }).eq('id', id);
    if (error) return { success: false, error: 'Erro ao atualizar aviso' };
    return { success: true, error: null };
  },
};
