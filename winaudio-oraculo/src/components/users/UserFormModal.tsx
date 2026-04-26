'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { departmentsService, usersService } from '@/services';
import type { Department, UserRole, UserProfile, CreateUserData, UpdateUserData } from '@/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => Promise<void>;
  onUpdate?: (id: string, data: UpdateUserData) => Promise<void>;
  editingUser?: UserProfile | null;
}

const roleOptions = [
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'gestor_setor', label: 'Gestor de Setor' },
  { value: 'admin_global', label: 'Admin Global' },
];

export function UserFormModal({ isOpen, onClose, onSubmit, onUpdate, editingUser }: UserFormModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('funcionario');
  const [departmentId, setDepartmentId] = useState('');
  const [cargo, setCargo] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDeps, setFetchingDeps] = useState(true);

  const isEditing = !!editingUser;

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      if (editingUser) {
        setFullName(editingUser.full_name || '');
        setRole(editingUser.role);
        setDepartmentId(editingUser.department_id || '');
        setCargo(editingUser.cargo || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingUser]);

  const fetchDepartments = async () => {
    const { data } = await departmentsService.getAll();
    setDepartments(data);
    setFetchingDeps(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setRole('funcionario');
    setDepartmentId('');
    setCargo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing && onUpdate) {
      await onUpdate(editingUser.id, {
        full_name: fullName,
        role,
        department_id: departmentId || null,
        cargo,
      });
    } else {
      await onSubmit({
        email,
        password,
        full_name: fullName,
        role,
        department_id: departmentId || null,
        cargo,
      });
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  const departmentOptions = departments.map((dep) => ({
    value: dep.id,
    label: dep.name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--color-bg-white)] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
                {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {isEditing ? 'Atualize os dados do usuário' : 'Cadastre um novo colaborador no sistema'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-light)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!isEditing && (
            <>
              <Input
                label="E-mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@winaudio.com.br"
              />

              <Input
                label="Senha"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </>
          )}

          <Input
            label="Nome Completo"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome do colaborador"
          />

          <Input
            label="Cargo"
            type="text"
            required
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ex: Analista de TI, Gerente Comercial"
          />

          <Select
            label="Função"
            required
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
          />

          <Select
            label="Setor"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={departmentOptions}
            placeholder="Selecione o setor..."
            disabled={fetchingDeps}
          />

          <div className="pt-4 border-t border-[var(--color-border-light)] flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="secondary"
              loading={loading}
              icon={<Save size={18} />}
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
