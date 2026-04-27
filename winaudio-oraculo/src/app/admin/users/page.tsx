'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { usersService } from '@/services';
import { AdminLayout, PageHeader } from '@/components/layout';
import { Button, SearchInput, LoadingSpinner, EmptyState, Dialog, Toast } from '@/components/ui';
import { UsersTable, UserFormModal } from '@/components/users';
import { AuthGuard } from '@/components/auth';
import type { UserProfile, CreateUserData, UpdateUserData } from '@/types';

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminUsersContent />
    </AuthGuard>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await usersService.getAll();
    setUsers(data);
    setLoading(false);
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    const { success, error } = await usersService.create(userData);
    if (success) {
      setIsModalOpen(false);
      fetchUsers();
      setToast({ open: true, message: 'Usuário criado com sucesso!', variant: 'success' });
    } else {
      setToast({ open: true, message: error || 'Erro ao criar usuário.', variant: 'error' });
    }
  };

  const handleUpdateUser = async (id: string, userData: UpdateUserData) => {
    const { success, error } = await usersService.update(id, userData);
    if (success) {
      handleCloseModal();
      fetchUsers();
      setToast({ open: true, message: 'Usuário atualizado com sucesso!', variant: 'success' });
    } else {
      setToast({ open: true, message: error || 'Erro ao atualizar usuário.', variant: 'error' });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const { success, error } = await usersService.delete(deleteId);
    setDeleteId(null);
    if (success) {
      setUsers(users.filter(u => u.id !== deleteId));
      setToast({ open: true, message: 'Usuário excluído com sucesso.', variant: 'success' });
    } else {
      setToast({ open: true, message: error || 'Não foi possível excluir o usuário.', variant: 'error' });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerActions = (
    <>
      <SearchInput
        placeholder="Buscar usuários..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-72"
      />
      <Button
        icon={<UserPlus size={18} />}
        onClick={() => setIsModalOpen(true)}
      >
        Novo Usuário
      </Button>
    </>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Gestão de Usuários"
        description="Gerencie os colaboradores e suas permissões no sistema."
        actions={headerActions}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <LoadingSpinner message="Carregando usuários..." />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="text-gray-300" size={32} />}
            title="Nenhum usuário encontrado"
            description="Você ainda não possui usuários cadastrados ou a sua busca não retornou resultados."
            action={
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[var(--color-primary)] font-semibold text-sm hover:underline"
              >
                Criar o primeiro usuário
              </button>
            }
          />
        ) : (
          <UsersTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateUser}
        onUpdate={handleUpdateUser}
        editingUser={editingUser}
      />

      <Dialog
        open={!!deleteId}
        variant="danger"
        title="Excluir usuário"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
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
