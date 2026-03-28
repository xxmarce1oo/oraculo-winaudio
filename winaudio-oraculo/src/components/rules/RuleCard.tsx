'use client';

import { FileText, Building, Globe, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Rule } from '@/types';

interface RuleCardProps {
  rule: Rule;
  onClick?: (rule: Rule) => void;
}

export function RuleCard({ rule, onClick }: RuleCardProps) {
  const getDepartmentName = (): string => {
    if (rule.type === 'me_consulte') return 'Todos os setores';
    return rule.departments?.[0]?.name || 'Não definido';
  };

  return (
    <div
      onClick={() => onClick?.(rule)}
      className={`
        bg-[var(--color-bg-white)] rounded-2xl shadow-sm border border-[var(--color-border-light)] p-6
        hover:shadow-md hover:border-[var(--color-border)] transition-all
        ${onClick ? 'cursor-pointer' : ''}
        group
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${rule.type === 'me_consulte'
              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
              : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'
            }
          `}
        >
          <FileText size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[var(--color-primary-dark)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
              {rule.title}
            </h3>
            {onClick && (
              <ChevronRight
                size={20}
                className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5"
              />
            )}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Badge
              variant={rule.type === 'me_consulte' ? 'primary' : 'secondary'}
              icon={rule.type === 'me_consulte' ? <Globe size={12} /> : <Building size={12} />}
            >
              {rule.type === 'me_consulte' ? 'Me Consulte' : 'Oráculo'}
            </Badge>

            <span className="text-xs text-[var(--color-text-light)]">
              {getDepartmentName()}
            </span>
          </div>

          <p className="text-xs text-[var(--color-text-light)] mt-2">
            Atualizado em {new Date(rule.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
