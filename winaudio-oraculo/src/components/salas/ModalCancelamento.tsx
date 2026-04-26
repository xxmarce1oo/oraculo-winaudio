'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SALA_MAP, type Agendamento, type CancelamentoTipo } from '@/types/salas';
import { formatarHora } from '@/lib/date-utils';

interface ModalCancelamentoProps {
  agendamento: Agendamento | null;
  onFechar: () => void;
  onConfirmar: (tipo: CancelamentoTipo) => Promise<void>;
}

export function ModalCancelamento({ agendamento, onFechar, onConfirmar }: ModalCancelamentoProps) {
  const [tipo, setTipo] = useState<CancelamentoTipo>('apenas_este');
  const [cancelando, setCancelando] = useState(false);

  if (!agendamento) return null;

  const sala = SALA_MAP[agendamento.sala];
  const temRecorrencia = agendamento.grupo_recorrencia_id !== null;

  const dataFormatada = new Date(agendamento.inicio).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  async function handleConfirmar() {
    setCancelando(true);
    try {
      await onConfirmar(tipo);
      onFechar();
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[var(--color-error)]" />
            Cancelar Agendamento
          </h2>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors">
            <X size={18} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Detalhes do agendamento */}
        <div className="px-6 py-5 space-y-4">
          <div
            className="rounded-xl p-4 border-l-4 space-y-1"
            style={{ borderColor: sala.cor, backgroundColor: sala.corClara }}
          >
            <p className="text-sm font-semibold" style={{ color: sala.cor }}>{sala.nome}</p>
            <p className="text-base font-bold text-[var(--color-text-primary)]">{agendamento.titulo}</p>
            <p className="text-sm text-[var(--color-text-muted)] capitalize">{dataFormatada}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {formatarHora(agendamento.inicio)} – {formatarHora(agendamento.fim)}
            </p>
          </div>

          {temRecorrencia && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                Este é um evento recorrente. O que deseja cancelar?
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: tipo === 'apenas_este' ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: tipo === 'apenas_este' ? '#ede9f7' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value="apenas_este"
                    checked={tipo === 'apenas_este'}
                    onChange={() => setTipo('apenas_este')}
                    className="mt-0.5 accent-[var(--color-primary)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Apenas este</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Cancela somente esta ocorrência</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: tipo === 'todos_futuros' ? 'var(--color-error)' : 'var(--color-border)',
                    backgroundColor: tipo === 'todos_futuros' ? '#fef2f2' : 'transparent',
                  }}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value="todos_futuros"
                    checked={tipo === 'todos_futuros'}
                    onChange={() => setTipo('todos_futuros')}
                    className="mt-0.5 accent-[var(--color-error)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Este e todos os futuros</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Cancela esta ocorrência e todas as seguintes</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {!temRecorrencia && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
          <Button variant="ghost" onClick={onFechar} disabled={cancelando}>Voltar</Button>
          <Button variant="danger" onClick={handleConfirmar} loading={cancelando}>
            Confirmar cancelamento
          </Button>
        </div>
      </div>
    </div>
  );
}
