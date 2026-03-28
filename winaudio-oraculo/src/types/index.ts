// Types centralizados do projeto WinAudio Oráculo

export * from './user';

export type RuleType = 'me_consulte' | 'oraculo';

export interface Department {
  id: string;
  name: string;
}

export interface Rule {
  id: string;
  title: string;
  content?: string;
  type: RuleType;
  department_id: string | null;
  created_at: string;
  created_by?: string | null;
  departments?: Department[] | null;
}

export interface RuleFormData {
  title: string;
  content: string;
  type: RuleType;
  department_id: string | null;
  created_by?: string | null;
}

export interface User {
  id: string;
  email?: string;
}
