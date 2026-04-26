'use client';

import { useState, useMemo } from 'react';
import { User, Edit, Trash2, Shield, Building, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { UserProfile, UserRole } from '@/types';

interface UsersTableProps {
  users: UserProfile[];
  onEdit?: (user: UserProfile) => void;
  onDelete?: (id: string) => void;
}

type SortKey = 'full_name' | 'role' | 'created_at';
type SortDirection = 'asc' | 'desc' | null;

const roleLabels: Record<UserRole, { label: string; variant: 'primary' | 'secondary' }> = {
  admin_global: { label: 'Admin Global', variant: 'primary' },
  gestor_setor: { label: 'Gestor de Setor', variant: 'secondary' },
  funcionario: { label: 'Funcionário', variant: 'secondary' },
};

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin_global: <Shield size={12} />,
  gestor_setor: <Building size={12} />,
  funcionario: <UserCheck size={12} />,
};

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

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

  const sortedUsers = useMemo(() => {
    if (!sortDir) return users;

    const sorted = [...users].sort((a, b) => {
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
  }, [users, sortKey, sortDir]);

  return (
    <div className="bg-[var(--color-bg-white)] rounded-2xl shadow-sm border border-[var(--color-border-light)] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
            <SortHeader label="Usuário" sortKey="full_name" />
            <SortHeader label="Função" sortKey="role" />
            <th className="px-6 py-4 font-semibold">Setor</th>
            <SortHeader label="Cadastrado em" sortKey="created_at" />
            <th className="px-6 py-4 font-semibold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedUsers.map((user) => {
            const roleConfig = roleLabels[user.role] || roleLabels.funcionario;
            const roleIcon = roleIcons[user.role] || roleIcons.funcionario;

            return (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-primary-dark)]">
                        {user.full_name || 'Sem nome'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.cargo || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={roleConfig.variant} icon={roleIcon}>
                    {roleConfig.label}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {user.departments?.name || 'Não definido'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                        title="Editar usuário"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
