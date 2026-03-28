'use client';

import { Globe, Building } from 'lucide-react';
import type { RuleType } from '@/types';

interface RuleTypeSelectorProps {
  value: RuleType;
  onChange: (type: RuleType) => void;
}

export function RuleTypeSelector({ value, onChange }: RuleTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        onClick={() => onChange('me_consulte')}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
          value === 'me_consulte'
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
            : 'border-[var(--color-border-light)] bg-[var(--color-bg-white)] hover:border-[var(--color-border)]'
        }`}
      >
        <Globe className={value === 'me_consulte' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'} size={24} />
        <div>
          <h3 className={`font-semibold ${value === 'me_consulte' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
            Me Consulte
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Regra global para toda a empresa.</p>
        </div>
      </div>

      <div
        onClick={() => onChange('oraculo')}
        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
          value === 'oraculo'
            ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5'
            : 'border-[var(--color-border-light)] bg-[var(--color-bg-white)] hover:border-[var(--color-border)]'
        }`}
      >
        <Building className={value === 'oraculo' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-light)]'} size={24} />
        <div>
          <h3 className={`font-semibold ${value === 'oraculo' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-secondary)]'}`}>
            Oráculo Setorial
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Regra restrita a um departamento.</p>
        </div>
      </div>
    </div>
  );
}
