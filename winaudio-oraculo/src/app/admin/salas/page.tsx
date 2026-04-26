'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CalendarioSemanal } from '@/components/salas/CalendarioSemanal';
import { ModalAgendamento } from '@/components/salas/ModalAgendamento';
import { ModalCancelamento } from '@/components/salas/ModalCancelamento';
import { ModalDetalhesAgendamento } from '@/components/salas/ModalDetalhesAgendamento';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { agendamentosService } from '@/services/agendamentos.service';
import { useAuth } from '@/context/AuthContext';
import { SALAS } from '@/types/salas';
import type { Agendamento, AgendamentoFormData, CancelamentoTipo } from '@/types/salas';

export default function AdminSalasPage() {
  const { semanaAtual, agendamentos, carregando, navegar, recarregar } = useAgendamentos();
  const { profile } = useAuth();

  const [agendamentoDetalhes, setAgendamentoDetalhes] = useState<Agendamento | null>(null);
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
  const [agendamentoCancelando, setAgendamentoCancelando] = useState<Agendamento | null>(null);
  const [dataInicial, setDataInicial] = useState<Date | null>(null);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function handleClicarBloco(agendamento: Agendamento) {
    setAgendamentoDetalhes(agendamento);
  }

  function handleClicarSlot(data: Date) {
    setAgendamentoEditando(null);
    setDataInicial(data);
    setModalFormAberto(true);
  }

  function handleEditar(agendamento: Agendamento) {
    setAgendamentoDetalhes(null);
    setAgendamentoEditando(agendamento);
    setModalFormAberto(true);
  }

  function handleAbrirCancelamento(agendamento: Agendamento) {
    setAgendamentoDetalhes(null);
    setAgendamentoCancelando(agendamento);
  }

  async function handleSalvar(formData: AgendamentoFormData) {
    if (!profile) return;
    setErro(null);

    if (agendamentoEditando) {
      const { error } = await agendamentosService.atualizar(agendamentoEditando.id, formData);
      if (error) throw new Error(error);
    } else {
      const { temConflito } = await agendamentosService.verificarConflito(
        formData.sala,
        new Date(formData.inicio).toISOString(),
        new Date(formData.fim).toISOString()
      );
      if (temConflito) throw new Error('Já existe um agendamento neste horário para esta sala.');

      const { error } = await agendamentosService.criar(
        formData,
        profile.id,
        profile.full_name ?? 'Sem nome'
      );
      if (error) throw new Error(error);
    }

    await recarregar();
  }

  async function handleCancelar(tipo: CancelamentoTipo) {
    if (!agendamentoCancelando) return;
    const { error } = await agendamentosService.cancelar(agendamentoCancelando, tipo);
    if (error) { setErro(error); return; }
    await recarregar();
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--color-border)] bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Gestão de Salas</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                Gerencie os agendamentos das salas
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                {SALAS.map((sala) => (
                  <div key={sala.id} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sala.cor }} />
                    <span className="text-xs text-[var(--color-text-muted)]">{sala.nome}</span>
                  </div>
                ))}
              </div>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => { setAgendamentoEditando(null); setDataInicial(null); setModalFormAberto(true); }}
              >
                Novo agendamento
              </Button>
            </div>
          </div>
          {erro && (
            <p className="mt-3 text-sm text-[var(--color-error)] bg-red-50 rounded-xl px-4 py-2">{erro}</p>
          )}
        </div>

        {/* Calendário */}
        <div className="flex-1 overflow-hidden p-6">
          {carregando ? (
            <LoadingSpinner message="Carregando agendamentos..." />
          ) : (
            <CalendarioSemanal
              semanaAtual={semanaAtual}
              agendamentos={agendamentos}
              onNavegar={navegar}
              onClicarAgendamento={handleClicarBloco}
              onClicarSlot={handleClicarSlot}
              podeEditar
            />
          )}
        </div>
      </div>

      {/* Modal de detalhes com ações */}
      <ModalDetalhesAgendamento
        agendamento={agendamentoDetalhes}
        onFechar={() => setAgendamentoDetalhes(null)}
        onEditar={handleEditar}
        onCancelar={handleAbrirCancelamento}
      />

      {/* Modal de formulário (criar / editar) */}
      <ModalAgendamento
        aberto={modalFormAberto}
        onFechar={() => { setModalFormAberto(false); setAgendamentoEditando(null); setDataInicial(null); }}
        onSalvar={handleSalvar}
        agendamento={agendamentoEditando}
        dataInicial={dataInicial}
      />

      {/* Modal de cancelamento */}
      <ModalCancelamento
        agendamento={agendamentoCancelando}
        onFechar={() => setAgendamentoCancelando(null)}
        onConfirmar={handleCancelar}
      />
    </AdminLayout>
  );
}
