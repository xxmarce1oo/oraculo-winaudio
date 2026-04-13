'use client';

import Link from 'next/link';
import { FileText, BookOpen, Globe, HelpCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Rule, RuleType } from '@/types';
import { RULE_TYPE_LABELS } from '@/types';

interface RuleCardProps {
  rule: Rule;
}

const typeConfig: Record<RuleType, { icon: React.ElementType; variant: 'primary' | 'secondary' | 'warning' | 'success' }> = {
  normativa: { icon: BookOpen, variant: 'primary' },
  procedimentos: { icon: FileText, variant: 'secondary' },
  me_consulte: { icon: Globe, variant: 'warning' },
  faq: { icon: HelpCircle, variant: 'success' },
};

export function RuleCard({ rule }: RuleCardProps) {
  const getDepartmentName = (): string => {
    if (rule.type === 'me_consulte') return 'Todos os setores';
    return rule.departments?.[0]?.name || 'Não definido';
  };

  const config = typeConfig[rule.type];
  const Icon = config.icon;

  return (
    <Link
      href={`/normativas/${rule.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[var(--color-bg-white)] rounded-2xl shadow-sm border border-[var(--color-border-light)] p-6 hover:shadow-md hover:border-[var(--color-border)] transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${rule.type === 'normativa' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : ''}
            ${rule.type === 'procedimentos' ? 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' : ''}
            ${rule.type === 'me_consulte' ? 'bg-amber-500/10 text-amber-500' : ''}
            ${rule.type === 'faq' ? 'bg-emerald-500/10 text-emerald-500' : ''}
          `}
        >
          <Icon size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-[var(--color-primary-dark)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
              {rule.title}
            </h3>
            <ExternalLink
              size={18}
              className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-all flex-shrink-0 mt-0.5"
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Badge
              variant={config.variant}
              icon={<Icon size={12} />}
            >
              {RULE_TYPE_LABELS[rule.type]}
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
    </Link>
  );
}
