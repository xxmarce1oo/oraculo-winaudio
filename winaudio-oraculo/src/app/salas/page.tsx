'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { CalendarioSemanal } from '@/components/salas/CalendarioSemanal';
import { ModalDetalhesAgendamento } from '@/components/salas/ModalDetalhesAgendamento';
import { ModalAgendamento } from '@/components/salas/ModalAgendamento';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SALAS } from '@/types/salas';
import { agendamentosService } from '@/services/agendamentos.service';
import { useAuth } from '@/context/AuthContext';
import type { Agendamento, AgendamentoFormData } from '@/types/salas';

export default function SalasPage() {
  const { semanaAtual, agendamentos, carregando, navegar, recarregar } = useAgendamentos();
  const { profile } = useAuth();
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [dataInicial, setDataInicial] = useState<Date | null>(null);
  const [filtroSala, setFiltroSala] = useState<string>('todas');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const agendamentosFiltrados = agendamentos.filter(a => {
    const matchSala = filtroSala === 'todas' || a.sala === filtroSala;
    const matchTexto = !buscaTexto || a.titulo.toLowerCase().includes(buscaTexto.toLowerCase()) || a.responsavel_nome?.toLowerCase().includes(buscaTexto.toLowerCase());
    return matchSala && matchTexto;
  });

  async function handleSalvar(formData: AgendamentoFormData) {
    if (!profile) return;
    setErro(null);

    const { temConflito } = await agendamentosService.verificarConflito(
      formData.sala,
      new Date(formData.inicio).toISOString(),
      new Date(formData.fim).toISOString()
    );
    if (temConflito) throw new Error('Já existe um agendamento neste horário para esta sala.');

    const { error } = await agendamentosService.criar(formData, profile.id, profile.full_name ?? 'Sem nome');
    if (error) throw new Error(error);
    await recarregar();
  }

  return (
    <EmployeeLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-8 py-5 border-b border-[var(--color-border)] bg-white flex-shrink-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Salas</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Visualize e agende as salas</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Busca por texto */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" />
                <input
                  type="text"
                  placeholder="Buscar agendamento..."
                  value={buscaTexto}
                  onChange={e => setBuscaTexto(e.target.value)}
                  className="pl-8 pr-8 py-2 text-sm border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] w-52"
                />
                {buscaTexto && (
                  <button onClick={() => setBuscaTexto('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-text-primary)]">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filtro por sala */}
              <div className="flex items-center gap-1.5 bg-[var(--color-bg-muted)] rounded-xl p-1">
                <button
                  onClick={() => setFiltroSala('todas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filtroSala === 'todas' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                >
                  Todas
                </button>
                {SALAS.map(sala => (
                  <button
                    key={sala.id}
                    onClick={() => setFiltroSala(sala.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filtroSala === sala.id ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                    style={{ color: filtroSala === sala.id ? sala.cor : undefined }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sala.cor }} />
                    {sala.nome}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {erro && <p className="mt-3 text-sm text-[var(--color-error)] bg-red-50 rounded-xl px-4 py-2">{erro}</p>}
        </div>

        <div className="flex-1 overflow-hidden p-6">
          {carregando ? (
            <LoadingSpinner message="Carregando agendamentos..." />
          ) : (
            <CalendarioSemanal
              semanaAtual={semanaAtual}
              agendamentos={agendamentosFiltrados}
              onNavegar={navegar}
              onClicarAgendamento={setAgendamentoSelecionado}
              onClicarSlot={(data) => { setDataInicial(data); setModalFormAberto(true); }}
              podeEditar={false}
            />
          )}
        </div>
      </div>

      <ModalDetalhesAgendamento
        agendamento={agendamentoSelecionado}
        onFechar={() => setAgendamentoSelecionado(null)}
      />

      <ModalAgendamento
        aberto={modalFormAberto}
        onFechar={() => { setModalFormAberto(false); setDataInicial(null); }}
        onSalvar={handleSalvar}
        dataInicial={dataInicial}
      />
    </EmployeeLayout>
  );
}
