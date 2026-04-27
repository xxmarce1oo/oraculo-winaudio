'use client';

import { useEffect, useState } from 'react';
import { Building, Plus } from 'lucide-react';
import { departmentsService } from '@/services';
import { AdminLayout, PageHeader } from '@/components/layout';
import { Button, SearchInput, LoadingSpinner, EmptyState, Dialog, Toast } from '@/components/ui';
import { DepartmentsTable, DepartmentFormModal } from '@/components/departments';
import { AuthGuard } from '@/components/auth';
import type { Department } from '@/types';

export default function AdminDepartmentsPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminDepartmentsContent />
    </AuthGuard>
  );
}

function AdminDepartmentsContent() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    const { data } = await departmentsService.getAll();
    setDepartments(data);
    setLoading(false);
  };

  const handleCreateOrUpdate = async (name: string) => {
    if (editingDepartment) {
      const { success, error } = await departmentsService.update(editingDepartment.id, name);
      if (success) {
        handleCloseModal();
        fetchDepartments();
        setToast({ open: true, message: 'Setor atualizado com sucesso!', variant: 'success' });
      } else {
        setToast({ open: true, message: error || 'Erro ao atualizar setor.', variant: 'error' });
      }
    } else {
      const { success, error } = await departmentsService.create(name);
      if (success) {
        handleCloseModal();
        fetchDepartments();
        setToast({ open: true, message: 'Setor criado com sucesso!', variant: 'success' });
      } else {
        setToast({ open: true, message: error || 'Erro ao criar setor.', variant: 'error' });
      }
    }
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const { success, error } = await departmentsService.delete(deleteId);
    setDeleteId(null);
    if (success) {
      setDepartments(departments.filter(dep => dep.id !== deleteId));
      setToast({ open: true, message: 'Setor excluído com sucesso.', variant: 'success' });
    } else {
      setToast({ open: true, message: error || 'Não foi possível excluir o setor.', variant: 'error' });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
  };

  const filteredDepartments = departments.filter(dep =>
    dep.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerActions = (
    <>
      <SearchInput
        placeholder="Buscar setores..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-72"
      />
      <Button
        icon={<Plus size={18} />}
        onClick={() => setIsModalOpen(true)}
      >
        Novo Setor
      </Button>
    </>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Gestão de Setores"
        description="Gerencie os departamentos e setores da empresa."
        actions={headerActions}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <LoadingSpinner message="Carregando setores..." />
        ) : filteredDepartments.length === 0 ? (
          <EmptyState
            icon={<Building className="text-gray-300" size={32} />}
            title="Nenhum setor encontrado"
            description="Você ainda não possui setores cadastrados ou a sua busca não retornou resultados."
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[var(--color-primary)] font-semibold text-sm hover:underline"
              >
                Criar o primeiro setor
              </button>
            }
          />
        ) : (
          <DepartmentsTable
            departments={filteredDepartments}
            onEdit={handleEditDepartment}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </div>

      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrUpdate}
        editingDepartment={editingDepartment}
      />

      <Dialog
        open={!!deleteId}
        variant="danger"
        title="Excluir setor"
        message="Tem certeza que deseja excluir este setor? Usuários vinculados a ele ficarão sem setor."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </AdminLayout>
  );
}
