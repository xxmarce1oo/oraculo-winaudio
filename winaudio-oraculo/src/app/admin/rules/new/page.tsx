'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, FileText, Video, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { rulesService, departmentsService, authService } from '@/services';
import { Button, Input, Select, Card, RichTextEditor, Toast } from '@/components/ui';
import { RuleTypeSelector } from '@/components/rules';
import { FormularioNormativa, montarHtmlNormativa } from '@/components/rules/FormularioNormativa';
import { AuthGuard } from '@/components/auth';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Department, RuleType, RuleStatus, NormativaSecoes } from '@/types';

export default function NewRulePage() {
  return (
    <AuthGuard requireAdmin>
      <NewRuleContent />
    </AuthGuard>
  );
}

const statusOptions: { value: RuleStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'vigente', label: 'Vigente', icon: CheckCircle, color: 'text-emerald-500' },
  { value: 'atualizacao_recente', label: 'Atualização Recente', icon: AlertTriangle, color: 'text-amber-500' },
  { value: 'obsoleta', label: 'Obsoleta', icon: XCircle, color: 'text-red-500' },
];

const secoesVazias: NormativaSecoes = {
  objetivo: '',
  passo_a_passo: '',
  regras_restricoes: '',
  procedimento_tecnico: '',
  checklist_finalizacao: '',
  consequencias: '',
};

function NewRuleContent() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RuleType>('normativa');
  const [status, setStatus] = useState<RuleStatus>('vigente');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [secoes, setSecoes] = useState<NormativaSecoes>(secoesVazias);
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFim, setVigenciaFim] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDeps, setFetchingDeps] = useState(true);

  const router = useRouter();

  useEffect(() => {
    departmentsService.getAll().then(({ data }) => {
      setDepartments(data);
      setFetchingDeps(false);
    });
  }, []);

  const setorSelecionado = departments.find((d) => d.id === departmentId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let conteudoFinal = content;
      let codigoWn: string | null = null;

      if (type === 'normativa') {
        if (departmentId) {
          const supabase = createSupabaseBrowserClient();
          const { data } = await supabase.rpc('proximo_codigo_wn', { p_department_id: departmentId });
          codigoWn = data as string;
        }

        conteudoFinal = montarHtmlNormativa(
          title,
          codigoWn ?? 'WN000',
          setorSelecionado?.name ?? '',
          vigenciaInicio,
          vigenciaFim,
          secoes
        );
      }

      const user = await authService.getCurrentUser();

      const { success, error } = await rulesService.create({
        title,
        content: conteudoFinal,
        type,
        status,
        department_id: type !== 'me_consulte' ? departmentId : null,
        video_url: videoUrl || null,
        created_by: user?.id || null,
        codigo_wn: codigoWn,
        vigencia_inicio: type === 'normativa' ? vigenciaInicio || null : null,
        vigencia_fim: type === 'normativa' ? vigenciaFim || null : null,
      });

      if (success) {
        setToast({ open: true, message: 'Artigo publicado com sucesso!', variant: 'success' });
        setTimeout(() => router.push('/admin/rules'), 1500);
      } else {
        setToast({ open: true, message: error || 'Erro ao publicar o artigo.', variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = departments.map((dep) => ({ value: dep.id, label: dep.name }));

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] font-sans">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <button
          onClick={() => router.push('/admin/rules')}
          className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar para a listagem
        </button>

        <Card className="rounded-3xl" padding="lg">
          <div className="flex items-center gap-4 mb-8 border-b border-[var(--color-border-light)] pb-6">
            <div className="w-14 h-14 bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">Publicar Novo Artigo</h1>
              <p className="text-[var(--color-text-muted)] text-sm">
                Crie um documento rico com formatação, vídeos e links.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4">
                Informações Básicas
              </h2>
              <div className="space-y-4">
                <Input
                  label="Título do Artigo"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Política de Reembolso de Viagens"
                />

                <RuleTypeSelector value={type} onChange={setType} />

                {type !== 'me_consulte' && (
                  <Select
                    label="Departamento Responsável"
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    disabled={fetchingDeps}
                    options={departmentOptions}
                    placeholder="Selecione o setor responsável..."
                  />
                )}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4">
                Status do Documento
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-white)]'}`}
                    >
                      <Icon size={24} className={option.color} />
                      <p className={`mt-2 font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {option.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4">
                Conteúdo do Artigo
              </h2>

              {type === 'normativa' ? (
                <FormularioNormativa
                  secoes={secoes}
                  onChange={setSecoes}
                  codigoWn={departmentId ? `WN${setorSelecionado?.name.substring(0, 3).toUpperCase()}###` : ''}
                  vigenciaInicio={vigenciaInicio}
                  vigenciaFim={vigenciaFim}
                  onVigenciaInicioChange={setVigenciaInicio}
                  onVigenciaFimChange={setVigenciaFim}
                />
              ) : (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Escreva o conteúdo do artigo aqui. Use a barra de ferramentas para formatar o texto..."
                />
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4">
                Mídia (Opcional)
              </h2>
              <div className="relative">
                <Input
                  label="URL do Vídeo"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                />
                <Video size={18} className="absolute right-3 top-9 text-[var(--color-text-light)]" />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Cole a URL de um vídeo do YouTube ou Vimeo para incorporá-lo ao artigo.
              </p>
            </section>

            <div className="pt-6 border-t border-[var(--color-border-light)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/admin/rules')}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium transition-colors"
              >
                Cancelar
              </button>
              <Button type="submit" variant="secondary" size="lg" loading={loading} icon={<Save size={20} />}>
                {loading ? 'Publicando...' : 'Publicar Artigo'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </div>
  );
}
