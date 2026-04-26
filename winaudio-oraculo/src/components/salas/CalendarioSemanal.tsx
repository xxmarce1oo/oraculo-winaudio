'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, startOfWeek, posicaoVertical, alturaBloco, formatarHora } from '@/lib/date-utils';
import { SALA_MAP, type Agendamento } from '@/types/salas';

const HORA_INICIO = 8;
const HORA_FIM = 19;
const TOTAL_MINUTOS = (HORA_FIM - HORA_INICIO) * 60;
const PX_POR_MINUTO = 2.5;
const ALTURA_TOTAL = TOTAL_MINUTOS * PX_POR_MINUTO;

interface CalendarioSemanalProps {
  semanaAtual: Date;
  agendamentos: Agendamento[];
  onNavegar: (direcao: 'anterior' | 'proxima') => void;
  onClicarAgendamento?: (agendamento: Agendamento) => void;
  onClicarSlot?: (data: Date) => void;
  podeEditar?: boolean;
}

export function CalendarioSemanal({
  semanaAtual,
  agendamentos,
  onNavegar,
  onClicarAgendamento,
  onClicarSlot,
  podeEditar = false,
}: CalendarioSemanalProps) {
  const diasSemana = useMemo(() => {
    const inicio = startOfWeek(semanaAtual);
    return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
  }, [semanaAtual]);

  const agendamentosPorDia = useMemo(() => {
    const mapa = new Map<string, Agendamento[]>();
    diasSemana.forEach((dia) => {
      const chave = dia.toDateString();
      mapa.set(chave, []);
    });

    agendamentos.forEach((ag) => {
      const dia = new Date(ag.inicio).toDateString();
      if (mapa.has(dia)) {
        mapa.get(dia)!.push(ag);
      }
    });

    return mapa;
  }, [diasSemana, agendamentos]);

  const tituloSemana = useMemo(() => {
    const inicio = diasSemana[0];
    const fim = diasSemana[6];
    const mesInicio = inicio.toLocaleDateString('pt-BR', { month: 'long' });
    const mesFim = fim.toLocaleDateString('pt-BR', { month: 'long' });
    if (mesInicio === mesFim) {
      return `${inicio.getDate()} – ${fim.getDate()} de ${mesInicio} de ${fim.getFullYear()}`;
    }
    return `${inicio.getDate()} de ${mesInicio} – ${fim.getDate()} de ${mesFim} de ${fim.getFullYear()}`;
  }, [diasSemana]);

  const horas = Array.from({ length: HORA_FIM - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);

  const hoje = new Date().toDateString();

  function handleClicarSlot(dia: Date, e: React.MouseEvent<HTMLDivElement>) {
    if (!podeEditar || !onClicarSlot) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutos = Math.floor(y / PX_POR_MINUTO);
    const hora = HORA_INICIO + Math.floor(minutos / 60);
    const minuto = Math.floor(minutos % 60 / 15) * 15;
    const data = new Date(dia);
    data.setHours(hora, minuto, 0, 0);
    onClicarSlot(data);
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <button
          onClick={() => onNavegar('anterior')}
          className="p-2 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          <ChevronLeft size={20} className="text-[var(--color-text-muted)]" />
        </button>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] capitalize">
          {tituloSemana}
        </h2>
        <button
          onClick={() => onNavegar('proxima')}
          className="p-2 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors"
        >
          <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      {/* Grade */}
      <div className="flex flex-1 overflow-auto">
        {/* Coluna de horas */}
        <div className="flex-shrink-0 w-16 border-r border-[var(--color-border)]">
          <div className="h-12 border-b border-[var(--color-border)]" />
          <div style={{ height: ALTURA_TOTAL }} className="relative">
            {horas.map((hora) => (
              <div
                key={hora}
                className="absolute w-full text-right pr-3"
                style={{ top: (hora - HORA_INICIO) * 60 * PX_POR_MINUTO - 9 }}
              >
                <span className="text-xs text-[var(--color-text-light)]">
                  {String(hora).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Colunas dos dias */}
        <div className="flex flex-1 min-w-0">
          {diasSemana.map((dia) => {
            const chave = dia.toDateString();
            const isHoje = chave === hoje;
            const agsDia = agendamentosPorDia.get(chave) ?? [];

            return (
              <div key={chave} className="flex-1 flex flex-col border-r border-[var(--color-border)] last:border-r-0 min-w-0">
                {/* Cabeçalho do dia */}
                <div className={`h-12 flex flex-col items-center justify-center border-b border-[var(--color-border)] ${isHoje ? 'bg-[var(--color-primary)]/5' : ''}`}>
                  <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase">
                    {dia.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span className={`text-sm font-semibold ${isHoje ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                    {dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>

                {/* Área de eventos */}
                <div
                  className="relative"
                  style={{ height: ALTURA_TOTAL }}
                  onClick={(e) => handleClicarSlot(dia, e)}
                >
                  {/* Linhas de hora */}
                  {horas.map((hora) => (
                    <div
                      key={hora}
                      className="absolute w-full border-t border-[var(--color-border-light)]"
                      style={{ top: (hora - HORA_INICIO) * 60 * PX_POR_MINUTO }}
                    />
                  ))}

                  {/* Agendamentos */}
                  {agsDia.map((ag) => {
                    const topo = posicaoVertical(ag.inicio, HORA_INICIO) * PX_POR_MINUTO;
                    const altura = Math.max(alturaBloco(ag.inicio, ag.fim) * PX_POR_MINUTO, 20);
                    const sala = SALA_MAP[ag.sala];

                    return (
                      <button
                        key={ag.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClicarAgendamento?.(ag);
                        }}
                        className="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 text-left overflow-hidden transition-opacity hover:opacity-90 cursor-pointer"
                        style={{
                          top: topo,
                          height: altura,
                          backgroundColor: sala.cor,
                          color: '#fff',
                        }}
                      >
                        <p className="text-[10px] font-semibold leading-tight truncate">
                          {formatarHora(ag.inicio)} – {formatarHora(ag.fim)}
                        </p>
                        {altura > 30 && (
                          <p className="text-[11px] font-medium leading-tight truncate mt-0.5">
                            {ag.titulo}
                          </p>
                        )}
                        {altura > 50 && (
                          <p className="text-[10px] opacity-80 leading-tight truncate">
                            {ag.responsavel_nome}
                          </p>
                        )}
                        {altura > 65 && (
                          <p className="text-[10px] opacity-70 leading-tight truncate">
                            {sala.nome}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
