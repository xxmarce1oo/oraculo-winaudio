// Types centralizados do projeto WinAudio Oráculo

export * from './user';
export * from './salas';

export type RuleType = 'procedimentos' | 'normativa' | 'me_consulte' | 'faq';
export type RuleStatus = 'vigente' | 'atualizacao_recente' | 'obsoleta';

export const RULE_TYPE_LABELS: Record<RuleType, string> = {
  procedimentos: 'Procedimentos',
  normativa: 'Normativa',
  me_consulte: 'Me Consulte',
  faq: 'FAQ',
};

export const RULE_STATUS_LABELS: Record<RuleStatus, string> = {
  vigente: 'Vigente',
  atualizacao_recente: 'Atualização Recente',
  obsoleta: 'Obsoleta',
};

export interface Department {
  id: string;
  name: string;
}

export interface RuleAttachment {
  name: string;
  url: string;
  size?: number;
}

export interface Rule {
  id: string;
  title: string;
  content?: string;
  type: RuleType;
  status: RuleStatus;
  department_id: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string | null;
  departments?: Department | null;
  video_url?: string | null;
  attachments?: RuleAttachment[] | null;
  replaced_by_id?: string | null;
  replaced_by_title?: string | null;
  reading_time_minutes?: number;
  codigo_wn?: string | null;
  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;
}

export interface RuleFormData {
  title: string;
  content: string;
  type: RuleType;
  status: RuleStatus;
  department_id: string | null;
  video_url?: string | null;
  attachments?: RuleAttachment[] | null;
  replaced_by_id?: string | null;
  created_by?: string | null;
  codigo_wn?: string | null;
  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;
}

// Campos estruturados de uma normativa (tipo = 'normativa')
export interface NormativaSecoes {
  objetivo: string;
  passo_a_passo: string;
  regras_restricoes: string;
  procedimento_tecnico: string;
  checklist_finalizacao: string;
  consequencias: string;
}

export interface User {
  id: string;
  email?: string;
}
