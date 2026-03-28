'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { rulesService, departmentsService } from '@/services';
import { Button, Input, TextArea, Select, Card, LoadingSpinner } from '@/components/ui';
import { RuleTypeSelector } from '@/components/rules';
import { AuthGuard } from '@/components/auth';
import type { Department, RuleType, Rule } from '@/types';

export default function EditRulePage() {
  return (
    <AuthGuard requireAdmin>
      <EditRuleContent />
    </AuthGuard>
  );
}

function EditRuleContent() {
  const params = useParams();
  const ruleId = params.id as string;

  const [rule, setRule] = useState<Rule | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RuleType>('me_consulte');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [ruleId]);

  const fetchData = async () => {
    setFetching(true);
    
    const [ruleResult, depsResult] = await Promise.all([
      rulesService.getById(ruleId),
      departmentsService.getAll(),
    ]);

    if (ruleResult.data) {
      const r = ruleResult.data;
      setRule(r);
      setTitle(r.title);
      setType(r.type);
      setDepartmentId(r.department_id || '');
      setContent(r.content || '');
    }

    setDepartments(depsResult.data);
    setFetching(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { success, error } = await rulesService.update(ruleId, {
      title,
      content,
      type,
      department_id: type === 'oraculo' ? departmentId : null,
    });

    if (success) {
      alert('Normativa atualizada com sucesso!');
      router.push('/admin/rules');
    } else {
      alert(error || 'Erro ao atualizar a normativa.');
    }

    setLoading(false);
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep.id,
    label: dep.name,
  }));

  if (fetching) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <LoadingSpinner message="Carregando normativa..." />
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Normativa não encontrada.</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-4 mb-8 border-b border-[var(--color-border-light)] pb-6">
            <div className="w-14 h-14 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">Editar Normativa</h1>
              <p className="text-[var(--color-text-muted)] text-sm">
                Atualize as informações da normativa existente.
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

            <div className="pt-4 border-t border-[var(--color-border-light)] flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/admin/rules')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                loading={loading}
                icon={<Save size={20} />}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
