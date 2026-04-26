'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SALAS, RECORRENCIA_LABELS, type Agendamento, type AgendamentoFormData, type Recorrencia, type SalaId } from '@/types/salas';
import { formatarDatetimeLocal } from '@/lib/date-utils';

interface ModalAgendamentoProps {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (data: AgendamentoFormData) => Promise<void>;
  agendamento?: Agendamento | null;
  dataInicial?: Date | null;
}

const RECORRENCIAS: Recorrencia[] = ['nenhuma', 'diaria', 'semanal', 'mensal'];

export function ModalAgendamento({
  aberto,
  onFechar,
  onSalvar,
  agendamento,
  dataInicial,
}: ModalAgendamentoProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState<AgendamentoFormData>({
    sala: 'reuniao',
    titulo: '',
    descricao: '',
    inicio: '',
    fim: '',
    recorrencia: 'nenhuma',
    repetir_ate: '',
  });

  useEffect(() => {
    if (!aberto) return;

    if (agendamento) {
      const inicioLocal = new Date(agendamento.inicio);
      const fimLocal = new Date(agendamento.fim);
      setForm({
        sala: agendamento.sala,
        titulo: agendamento.titulo,
        descricao: agendamento.descricao ?? '',
        inicio: formatarDatetimeLocal(inicioLocal),
        fim: formatarDatetimeLocal(fimLocal),
        recorrencia: agendamento.recorrencia,
        repetir_ate: '',
      });
    } else {
      const base = dataInicial ?? new Date();
      if (base.getHours() < 8) base.setHours(8, 0, 0, 0);
      if (base.getHours() >= 19) base.setHours(18, 0, 0, 0);

      const fim = new Date(base);
      fim.setHours(fim.getHours() + 1);
      if (fim.getHours() > 19) fim.setHours(19, 0, 0, 0);

      setForm({
        sala: 'reuniao',
        titulo: '',
        descricao: '',
        inicio: formatarDatetimeLocal(base),
        fim: formatarDatetimeLocal(fim),
        recorrencia: 'nenhuma',
        repetir_ate: '',
      });
    }

    setErro(null);
  }, [aberto, agendamento, dataInicial]);

  if (!aberto) return null;

  function validar(): string | null {
    if (!form.titulo.trim()) return 'Informe um título.';
    if (!form.inicio) return 'Informe o horário de início.';
    if (!form.fim) return 'Informe o horário de término.';

    const inicio = new Date(form.inicio);
    const fim = new Date(form.fim);

    if (fim <= inicio) return 'O horário de término deve ser após o início.';

    const horaInicio = inicio.getHours() + inicio.getMinutes() / 60;
    const horaFim = fim.getHours() + fim.getMinutes() / 60;

    if (horaInicio < 8) return 'O horário de início não pode ser antes das 08:00.';
    if (horaFim > 19) return 'O horário de término não pode ser após as 19:00.';

    if (form.recorrencia !== 'nenhuma' && !form.repetir_ate) {
      return 'Informe até quando a recorrência deve se repetir.';
    }

    return null;
  }

  async function handleSalvar() {
    const erro = validar();
    if (erro) { setErro(erro); return; }

    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(form);
      onFechar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar agendamento.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Calendar size={18} className="text-[var(--color-primary)]" />
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors">
            <X size={18} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Sala */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Sala</label>
            <div className="flex gap-3">
              {SALAS.map((sala) => (
                <button
                  key={sala.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, sala: sala.id as SalaId }))}
                  className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={{
                    borderColor: form.sala === sala.id ? sala.cor : 'var(--color-border)',
                    backgroundColor: form.sala === sala.id ? sala.corClara : 'transparent',
                    color: form.sala === sala.id ? sala.cor : 'var(--color-text-muted)',
                  }}
                >
                  {sala.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Título</label>
            <input
              type="text"
              placeholder="Ex: Reunião de alinhamento"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              className="w-full border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">Descrição <span className="text-[var(--color-text-light)] font-normal">(opcional)</span></label>
            <textarea
              placeholder="Detalhes do agendamento..."
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              rows={2}
              className="w-full border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Clock size={14} /> Início
              </label>
              <input
                type="datetime-local"
                value={form.inicio}
                min={`${form.inicio?.split('T')[0]}T08:00`}
                max={`${form.inicio?.split('T')[0]}T19:00`}
                onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))}
                className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Clock size={14} /> Término
              </label>
              <input
                type="datetime-local"
                value={form.fim}
                min={form.inicio || `${form.fim?.split('T')[0]}T08:00`}
                max={`${form.fim?.split('T')[0]}T19:00`}
                onChange={(e) => setForm((f) => ({ ...f, fim: e.target.value }))}
                className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Recorrência — só na criação */}
          {!agendamento && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <RefreshCw size={14} /> Recorrência
              </label>
              <div className="flex flex-wrap gap-2">
                {RECORRENCIAS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, recorrencia: r }))}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                    style={{
                      borderColor: form.recorrencia === r ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: form.recorrencia === r ? 'var(--color-primary)' : 'transparent',
                      color: form.recorrencia === r ? '#fff' : 'var(--color-text-muted)',
                    }}
                  >
                    {RECORRENCIA_LABELS[r]}
                  </button>
                ))}
              </div>

              {form.recorrencia !== 'nenhuma' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--color-text-secondary)]">Repetir até</label>
                  <input
                    type="date"
                    value={form.repetir_ate}
                    onChange={(e) => setForm((f) => ({ ...f, repetir_ate: e.target.value }))}
                    className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  />
                </div>
              )}
            </div>
          )}

          {erro && (
            <p className="text-sm text-[var(--color-error)] bg-red-50 rounded-xl px-4 py-3">{erro}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
          <Button variant="ghost" onClick={onFechar} disabled={salvando}>Cancelar</Button>
          <Button variant="primary" onClick={handleSalvar} loading={salvando}>
            {agendamento ? 'Salvar alterações' : 'Agendar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
