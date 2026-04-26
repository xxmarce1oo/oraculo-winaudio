'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Agendamento, AgendamentoFormData, CancelamentoTipo, SalaId } from '@/types/salas';
import { addDays, addWeeks, addMonths } from '@/lib/date-utils';

const supabase = createSupabaseBrowserClient();

export const agendamentosService = {
  async listarPorSemana(inicioSemana: Date, fimSemana: Date): Promise<{ data: Agendamento[]; error: string | null }> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('cancelado', false)
      .gte('inicio', inicioSemana.toISOString())
      .lte('inicio', fimSemana.toISOString())
      .order('inicio', { ascending: true });

    if (error) return { data: [], error: error.message };
    return { data: data as Agendamento[], error: null };
  },

  async criar(
    formData: AgendamentoFormData,
    responsavelId: string,
    responsavelNome: string
  ): Promise<{ success: boolean; error: string | null }> {
    const grupoId = formData.recorrencia !== 'nenhuma' ? crypto.randomUUID() : null;

    const ocorrencias = gerarOcorrencias(formData, responsavelId, responsavelNome, grupoId);

    const { error } = await supabase.from('agendamentos').insert(ocorrencias);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async atualizar(
    id: string,
    formData: Partial<AgendamentoFormData>
  ): Promise<{ success: boolean; error: string | null }> {
    const { error } = await supabase
      .from('agendamentos')
      .update({
        titulo: formData.titulo,
        descricao: formData.descricao,
        sala: formData.sala,
        inicio: formData.inicio,
        fim: formData.fim,
      })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  },

  async cancelar(
    agendamento: Agendamento,
    tipo: CancelamentoTipo
  ): Promise<{ success: boolean; error: string | null }> {
    if (tipo === 'apenas_este') {
      const { error } = await supabase
        .from('agendamentos')
        .update({ cancelado: true })
        .eq('id', agendamento.id);

      if (error) return { success: false, error: error.message };
    } else {
      if (!agendamento.grupo_recorrencia_id) {
        const { error } = await supabase
          .from('agendamentos')
          .update({ cancelado: true })
          .eq('id', agendamento.id);
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase
          .from('agendamentos')
          .update({ cancelado: true })
          .eq('grupo_recorrencia_id', agendamento.grupo_recorrencia_id)
          .gte('inicio', agendamento.inicio);

        if (error) return { success: false, error: error.message };
      }
    }

    return { success: true, error: null };
  },

  async verificarConflito(
    sala: SalaId,
    inicio: string,
    fim: string,
    excluirId?: string
  ): Promise<{ temConflito: boolean; error: string | null }> {
    let query = supabase
      .from('agendamentos')
      .select('id')
      .eq('sala', sala)
      .eq('cancelado', false)
      .lt('inicio', fim)
      .gt('fim', inicio);

    if (excluirId) {
      query = query.neq('id', excluirId);
    }

    const { data, error } = await query;

    if (error) return { temConflito: false, error: error.message };
    return { temConflito: (data?.length ?? 0) > 0, error: null };
  },
};

function gerarOcorrencias(
  formData: AgendamentoFormData,
  responsavelId: string,
  responsavelNome: string,
  grupoId: string | null
): object[] {
  const base = {
    sala: formData.sala,
    titulo: formData.titulo,
    descricao: formData.descricao || null,
    responsavel_id: responsavelId,
    responsavel_nome: responsavelNome,
    recorrencia: formData.recorrencia,
    grupo_recorrencia_id: grupoId,
    cancelado: false,
  };

  if (formData.recorrencia === 'nenhuma') {
    return [{ ...base, inicio: formData.inicio, fim: formData.fim }];
  }

  const limite = formData.repetir_ate ? new Date(formData.repetir_ate) : null;
  if (!limite) return [{ ...base, inicio: formData.inicio, fim: formData.fim }];

  const ocorrencias: object[] = [];
  let inicio = new Date(formData.inicio);
  let fim = new Date(formData.fim);

  while (inicio <= limite) {
    ocorrencias.push({ ...base, inicio: inicio.toISOString(), fim: fim.toISOString() });

    switch (formData.recorrencia) {
      case 'diaria':
        inicio = addDays(inicio, 1);
        fim = addDays(fim, 1);
        break;
      case 'semanal':
        inicio = addWeeks(inicio, 1);
        fim = addWeeks(fim, 1);
        break;
      case 'mensal':
        inicio = addMonths(inicio, 1);
        fim = addMonths(fim, 1);
        break;
    }
  }

  return ocorrencias;
}
