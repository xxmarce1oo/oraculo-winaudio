'use client';

import { X, FileText, Building, Globe, Calendar } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { Rule } from '@/types';

interface RuleDetailModalProps {
  rule: Rule | null;
  onClose: () => void;
}

export function RuleDetailModal({ rule, onClose }: RuleDetailModalProps) {
  if (!rule) return null;

  const getDepartmentName = (): string => {
    if (rule.type === 'me_consulte') return 'Todos os setores';
    return rule.departments?.[0]?.name || 'Não definido';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[var(--color-bg-white)] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-4">
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${rule.type === 'me_consulte'
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
                }
              `}
            >
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">{rule.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant={rule.type === 'me_consulte' ? 'primary' : 'secondary'}
                  icon={rule.type === 'me_consulte' ? <Globe size={12} /> : <Building size={12} />}
                >
                  {rule.type === 'me_consulte' ? 'Me Consulte' : 'Oráculo'}
                </Badge>
                <span className="text-xs text-[var(--color-text-light)]">{getDepartmentName()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <div className="bg-[var(--color-bg-muted)] rounded-2xl p-6 text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
              {rule.content || 'Conteúdo não disponível.'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-[var(--color-border-light)] bg-[var(--color-bg-muted)]/50">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-light)]">
            <Calendar size={14} />
            Publicado em {new Date(rule.created_at).toLocaleDateString('pt-BR')}
          </div>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
