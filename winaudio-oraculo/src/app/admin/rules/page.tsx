'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { rulesService } from '@/services';
import { AdminLayout, PageHeader } from '@/components/layout';
import { Button, SearchInput, LoadingSpinner, EmptyState } from '@/components/ui';
import { RulesTable } from '@/components/rules';
import { AuthGuard } from '@/components/auth';
import type { Rule } from '@/types';

export default function AdminRulesPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminRulesContent />
    </AuthGuard>
  );
}

function AdminRulesContent() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    const { data } = await rulesService.getAll();
    setRules(data);
    setLoading(false);
  };

  const handleEdit = (rule: Rule) => {
    router.push(`/admin/rules/${rule.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta normativa? A IA não terá mais acesso a esta informação.')) {
      return;
    }

    const { success, error } = await rulesService.delete(id);
    if (success) {
      setRules(rules.filter(rule => rule.id !== id));
    } else {
      alert(error || 'Não foi possível excluir a normativa.');
    }
  };

  const filteredRules = rules.filter(rule =>
    rule.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerActions = (
    <>
      <SearchInput
        placeholder="Buscar normas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full md:w-72"
      />
      <Button
        icon={<Plus size={18} />}
        onClick={() => router.push('/admin/rules/new')}
      >
        Nova Norma
      </Button>
    </>
  );

  return (
    <AdminLayout>
      <PageHeader
        title="Base de Conhecimento"
        description='Gerencie as regras do "Me Consulte" e instruções setoriais do "Oráculo".'
        actions={headerActions}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <LoadingSpinner message="Carregando normativas..." />
        ) : filteredRules.length === 0 ? (
          <EmptyState
            icon={<FileText className="text-gray-300" size={32} />}
            title="Nenhuma norma encontrada"
            description="Você ainda não possui regras cadastradas ou a sua busca não retornou resultados."
            action={
              <button
                onClick={() => router.push('/admin/rules/new')}
                className="text-[var(--color-primary)] font-semibold text-sm hover:underline"
              >
                Criar a primeira normativa
              </button>
            }
          />
        ) : (
          <RulesTable
            rules={filteredRules}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AdminLayout>
  );
}