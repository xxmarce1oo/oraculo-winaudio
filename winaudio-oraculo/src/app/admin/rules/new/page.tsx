'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { rulesService, departmentsService, authService } from '@/services';
import { Button, Input, TextArea, Select, Card } from '@/components/ui';
import { RuleTypeSelector } from '@/components/rules';
import { AuthGuard } from '@/components/auth';
import type { Department, RuleType } from '@/types';

export default function NewRulePage() {
  return (
    <AuthGuard requireAdmin>
      <NewRuleContent />
    </AuthGuard>
  );
}

function NewRuleContent() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RuleType>('me_consulte');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDeps, setFetchingDeps] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data } = await departmentsService.getAll();
    setDepartments(data);
    setFetchingDeps(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = await authService.getCurrentUser();

    const { success, error } = await rulesService.create({
      title,
      content,
      type,
      department_id: type === 'oraculo' ? departmentId : null,
      created_by: user?.id || null,
    });

    if (success) {
      alert('Normativa salva com sucesso!');
      router.push('/admin/rules');
    } else {
      alert(error || 'Erro ao salvar a normativa.');
    }

    setLoading(false);
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep.id,
    label: dep.name,
  }));

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] font-sans flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.push('/admin/rules')}
          className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para a listagem
        </button>

        <Card className="rounded-3xl" padding="lg">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="w-14 h-14 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">Nova Normativa</h1>
              <p className="text-gray-500 text-sm">
                Cadastre uma nova regra para a inteligência artificial consultar.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <Input
              label="Título da Norma"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Política de Reembolso de Viagens"
            />

            <RuleTypeSelector value={type} onChange={setType} />

            {type === 'oraculo' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Select
                  label="Departamento"
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={fetchingDeps}
                  options={departmentOptions}
                  placeholder="Selecione o setor responsável..."
                />
              </div>
            )}

            <TextArea
              label="Texto Completo da Normativa"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Escreva as regras aqui. Lembre-se que a Inteligência Artificial lerá este texto para responder os funcionários..."
            />

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={loading}
                icon={<Save size={20} />}
              >
                {loading ? 'Salvando...' : 'Salvar Normativa'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}