'use client';

import { useState, useMemo } from 'react';
import { Edit, Trash2, Building, Globe, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Rule } from '@/types';

interface RulesTableProps {
  rules: Rule[];
  onEdit?: (rule: Rule) => void;
  onDelete?: (id: string) => void;
}

type SortKey = 'title' | 'type' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

export function RulesTable({ rules, onEdit, onDelete }: RulesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const getDepartmentName = (rule: Rule): string => {
    if (rule.type === 'me_consulte') return 'Todos (Global)';
    return rule.departments?.[0]?.name || 'Não definido';
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') setSortDir(null);
      else setSortDir('asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => {
    const isActive = sortKey === key;
    const isAsc = isActive && sortDir === 'asc';
    const isDesc = isActive && sortDir === 'desc';

    return (
      <th
        onClick={() => handleSort(key)}
        className="px-6 py-4 font-semibold cursor-pointer hover:bg-[var(--color-bg-light)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isAsc && <ChevronUp size={16} className="text-[var(--color-primary)]" />}
          {isDesc && <ChevronDown size={16} className="text-[var(--color-primary)]" />}
          {!isActive && <ChevronUp size={16} className="text-gray-300" />}
        </div>
      </th>
    );
  };

  const sortedRules = useMemo(() => {
    if (!sortDir) return rules;

    const sorted = [...rules].sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];

      if (sortKey === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [rules, sortKey, sortDir]);

  return (
    <div className="bg-[var(--color-bg-white)] rounded-2xl shadow-sm border border-[var(--color-border-light)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
            <SortHeader label="Título da Normativa" sortKey="title" />
            <SortHeader label="Categoria" sortKey="type" />
            <th className="px-6 py-4 font-semibold">Setor Relacionado</th>
            <th className="px-6 py-4 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRules.map((rule) => (
            <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <p className="text-sm font-semibold text-[var(--color-primary-dark)]">{rule.title}</p>
                <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                  Adicionado em {new Date(rule.created_at).toLocaleDateString('pt-BR')}
                </p>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={rule.type === 'me_consulte' ? 'primary' : 'secondary'}
                  icon={rule.type === 'me_consulte' ? <Globe size={12} /> : <Building size={12} />}
                >
                  {rule.type === 'me_consulte' ? 'Me Consulte' : 'Oráculo'}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {getDepartmentName(rule)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(rule)}
                      className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                      title="Editar norma"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir norma"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
