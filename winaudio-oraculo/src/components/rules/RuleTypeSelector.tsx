'use client';

import { FileText, BookOpen, HelpCircle, Globe } from 'lucide-react';
import type { RuleType } from '@/types';

interface RuleTypeSelectorProps {
  value: RuleType;
  onChange: (type: RuleType) => void;
}

interface TypeOption {
  type: RuleType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const typeOptions: TypeOption[] = [
  {
    type: 'normativa',
    label: 'Normativa',
    description: 'Regras e políticas oficiais da empresa.',
    icon: BookOpen,
    color: 'var(--color-primary)',
    bgColor: 'var(--color-primary)',
  },
  {
    type: 'procedimentos',
    label: 'Procedimentos',
    description: 'Processos e fluxos de trabalho.',
    icon: FileText,
    color: 'var(--color-secondary)',
    bgColor: 'var(--color-secondary)',
  },
  {
    type: 'me_consulte',
    label: 'Me Consulte',
    description: 'Regra global para toda a empresa.',
    icon: Globe,
    color: '#f59e0b',
    bgColor: '#f59e0b',
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Perguntas frequentes e respostas.',
    icon: HelpCircle,
    color: '#10b981',
    bgColor: '#10b981',
  },
];

export function RuleTypeSelector({ value, onChange }: RuleTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {typeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.type;

        return (
          <div
            key={option.type}
            onClick={() => onChange(option.type)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
              isSelected
                ? 'bg-opacity-5'
                : 'border-[var(--color-border-light)] bg-[var(--color-bg-white)] hover:border-[var(--color-border)]'
            }`}
            style={{
              borderColor: isSelected ? option.color : undefined,
              backgroundColor: isSelected ? `${option.bgColor}10` : undefined,
            }}
          >
            <Icon
              size={24}
              style={{ color: isSelected ? option.color : 'var(--color-text-light)' }}
            />
            <div>
              <h3
                className="font-semibold"
                style={{ color: isSelected ? option.color : 'var(--color-text-secondary)' }}
              >
                {option.label}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {option.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
