'use client';

import { useState, useMemo } from 'react';
import { Building, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Department } from '@/types';

interface DepartmentsTableProps {
  departments: Department[];
  onEdit?: (department: Department) => void;
  onDelete?: (id: string) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export function DepartmentsTable({ departments, onEdit, onDelete }: DepartmentsTableProps) {
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = () => {
    if (sortDir === 'asc') setSortDir('desc');
    else if (sortDir === 'desc') setSortDir(null);
    else setSortDir('asc');
  };

  const sortedDepartments = useMemo(() => {
    if (!sortDir) return departments;

    const sorted = [...departments].sort((a, b) => {
      return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

    return sorted;
  }, [departments, sortDir]);

  return (
    <div className="bg-[var(--color-bg-white)] rounded-2xl shadow-sm border border-[var(--color-border-light)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
            <th
              onClick={handleSort}
              className="px-6 py-4 font-semibold cursor-pointer hover:bg-[var(--color-bg-light)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>Setor</span>
                {sortDir === 'asc' && <ChevronUp size={16} className="text-[var(--color-primary)]" />}
                {sortDir === 'desc' && <ChevronDown size={16} className="text-[var(--color-primary)]" />}
                {!sortDir && <ChevronUp size={16} className="text-gray-300" />}
              </div>
            </th>
            <th className="px-6 py-4 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedDepartments.map((department) => (
            <tr key={department.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-xl flex items-center justify-center">
                    <Building size={20} />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-primary-dark)]">
                    {department.name}
                  </p>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(department)}
                      className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                      title="Editar setor"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(department.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir setor"
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
