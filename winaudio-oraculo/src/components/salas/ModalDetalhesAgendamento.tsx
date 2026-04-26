'use client';

import { X, Clock, User, MapPin, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SALA_MAP, RECORRENCIA_LABELS, type Agendamento } from '@/types/salas';
import { formatarHora } from '@/lib/date-utils';

interface ModalDetalhesAgendamentoProps {
  agendamento: Agendamento | null;
  onFechar: () => void;
  onEditar?: (agendamento: Agendamento) => void;
  onCancelar?: (agendamento: Agendamento) => void;
}

export function ModalDetalhesAgendamento({
  agendamento,
  onFechar,
  onEditar,
  onCancelar,
}: ModalDetalhesAgendamentoProps) {
  if (!agendamento) return null;

  const sala = SALA_MAP[agendamento.sala];
  const dataFormatada = new Date(agendamento.inicio).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const podeGerenciar = !!(onEditar || onCancelar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Topo colorido */}
        <div className="rounded-t-2xl px-6 py-5" style={{ backgroundColor: sala.cor }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">{sala.nome}</p>
              <h2 className="text-lg font-bold text-white mt-1">{agendamento.titulo}</h2>
            </div>
            <button onClick={onFechar} className="p-2 rounded-xl hover:bg-white/20 transition-colors mt-0.5">
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Detalhes */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <Clock size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
            <div>
              <p className="capitalize font-medium text-[var(--color-text-primary)]">{dataFormatada}</p>
              <p>{formatarHora(agendamento.inicio)} – {formatarHora(agendamento.fim)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <User size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
            <span>{agendamento.responsavel_nome}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <MapPin size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
            <span>{sala.nome}</span>
          </div>

          {agendamento.recorrencia !== 'nenhuma' && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <RefreshCw size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
              <span>Recorrência {RECORRENCIA_LABELS[agendamento.recorrencia].toLowerCase()}</span>
            </div>
          )}

          {agendamento.descricao && (
            <div className="bg-[var(--color-bg-muted)] rounded-xl px-4 py-3">
              <p className="text-sm text-[var(--color-text-secondary)]">{agendamento.descricao}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
          {podeGerenciar ? (
            <>
              <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => onCancelar?.(agendamento)}>
                Cancelar agendamento
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onFechar}>Fechar</Button>
                <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => onEditar?.(agendamento)}>
                  Editar
                </Button>
              </div>
            </>
          ) : (
            <div className="ml-auto">
              <Button variant="ghost" onClick={onFechar}>Fechar</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
