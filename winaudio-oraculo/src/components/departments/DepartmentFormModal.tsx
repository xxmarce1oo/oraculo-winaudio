'use client';

import { useState, useEffect } from 'react';
import { X, Building, Save } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import type { Department } from '@/types';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  editingDepartment?: Department | null;
}

export function DepartmentFormModal({ isOpen, onClose, onSubmit, editingDepartment }: DepartmentFormModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingDepartment;

  useEffect(() => {
    if (isOpen) {
      if (editingDepartment) {
        setName(editingDepartment.name);
      } else {
        setName('');
      }
    }
  }, [isOpen, editingDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(name);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--color-bg-white)] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-light)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-xl flex items-center justify-center">
              <Building size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">
                {isEditing ? 'Editar Setor' : 'Novo Setor'}
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {isEditing ? 'Atualize o nome do setor' : 'Cadastre um novo setor da empresa'}
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
          <Input
            label="Nome do Setor"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Recursos Humanos"
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
              {isEditing ? 'Salvar Alterações' : 'Criar Setor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
