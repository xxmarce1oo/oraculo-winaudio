'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import { usersService } from '@/services';
import { AdminLayout, PageHeader } from '@/components/layout';
import { Button, SearchInput, LoadingSpinner, EmptyState } from '@/components/ui';
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
      alert('Usuário criado com sucesso!');
      setIsModalOpen(false);
      fetchUsers();
    } else {
      alert(error || 'Erro ao criar usuário.');
    }
  };

  const handleUpdateUser = async (id: string, userData: UpdateUserData) => {
    const { success, error } = await usersService.update(id, userData);
    
    if (success) {
      alert('Usuário atualizado com sucesso!');
      handleCloseModal();
      fetchUsers();
    } else {
      alert(error || 'Erro ao atualizar usuário.');
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    const { success, error } = await usersService.delete(id);
    
    if (success) {
      setUsers(users.filter(user => user.id !== id));
    } else {
      alert(error || 'Não foi possível excluir o usuário.');
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
            onDelete={handleDeleteUser}
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
    </AdminLayout>
  );
}
