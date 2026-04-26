'use client';

import { useState, useEffect, useCallback } from 'react';
import { agendamentosService } from '@/services/agendamentos.service';
import { startOfWeek, endOfWeek, addDays } from '@/lib/date-utils';
import type { Agendamento } from '@/types/salas';

export function useAgendamentos() {
  const [semanaAtual, setSemanaAtual] = useState(() => startOfWeek(new Date()));
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const fim = endOfWeek(semanaAtual);
    const { data } = await agendamentosService.listarPorSemana(semanaAtual, fim);
    setAgendamentos(data);
    setCarregando(false);
  }, [semanaAtual]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function navegar(direcao: 'anterior' | 'proxima') {
    setSemanaAtual((atual) => addDays(atual, direcao === 'proxima' ? 7 : -7));
  }

  return { semanaAtual, agendamentos, carregando, navegar, recarregar: carregar };
}
