'use client';

import { useState } from 'react';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { CalendarioSemanal } from '@/components/salas/CalendarioSemanal';
import { ModalDetalhesAgendamento } from '@/components/salas/ModalDetalhesAgendamento';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SALAS } from '@/types/salas';
import type { Agendamento } from '@/types/salas';

export default function SalasPage() {
  const { semanaAtual, agendamentos, carregando, navegar } = useAgendamentos();
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);

  return (
    <EmployeeLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--color-border)] bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Salas</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Visualize os agendamentos das salas</p>
            </div>
            {/* Legenda */}
            <div className="flex items-center gap-4">
              {SALAS.map((sala) => (
                <div key={sala.id} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sala.cor }} />
                  <span className="text-xs text-[var(--color-text-muted)]">{sala.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          {carregando ? (
            <LoadingSpinner message="Carregando agendamentos..." />
          ) : (
            <CalendarioSemanal
              semanaAtual={semanaAtual}
              agendamentos={agendamentos}
              onNavegar={navegar}
              onClicarAgendamento={setAgendamentoSelecionado}
              podeEditar={false}
            />
          )}
        </div>
      </div>

      <ModalDetalhesAgendamento
        agendamento={agendamentoSelecionado}
        onFechar={() => setAgendamentoSelecionado(null)}
      />
    </EmployeeLayout>
  );
}
