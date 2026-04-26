export type SalaId = 'treinamento' | 'reuniao';
export type Recorrencia = 'nenhuma' | 'diaria' | 'semanal' | 'mensal';

export interface Sala {
  id: SalaId;
  nome: string;
  cor: string;
  corClara: string;
}

export const SALAS: Sala[] = [
  {
    id: 'treinamento',
    nome: 'Sala de Treinamento',
    cor: '#55419b',
    corClara: '#ede9f7',
  },
  {
    id: 'reuniao',
    nome: 'Sala de Reunião',
    cor: '#14afaf',
    corClara: '#e0f7f7',
  },
];

export const SALA_MAP: Record<SalaId, Sala> = {
  treinamento: SALAS[0],
  reuniao: SALAS[1],
};

export const RECORRENCIA_LABELS: Record<Recorrencia, string> = {
  nenhuma: 'Sem recorrência',
  diaria: 'Diária',
  semanal: 'Semanal',
  mensal: 'Mensal',
};

export interface Agendamento {
  id: string;
  sala: SalaId;
  titulo: string;
  descricao: string | null;
  responsavel_id: string;
  responsavel_nome: string;
  inicio: string;
  fim: string;
  recorrencia: Recorrencia;
  grupo_recorrencia_id: string | null;
  cancelado: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface AgendamentoFormData {
  sala: SalaId;
  titulo: string;
  descricao: string;
  inicio: string;
  fim: string;
  recorrencia: Recorrencia;
  repetir_ate?: string;
}

export type CancelamentoTipo = 'apenas_este' | 'todos_futuros';
