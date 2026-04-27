'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, FileText, Video, CheckCircle, AlertTriangle, XCircle, Link as LinkIcon, History, ChevronDown, ChevronUp } from 'lucide-react';
import { rulesService, departmentsService } from '@/services';
import { Button, Input, Select, Card, LoadingSpinner, RichTextEditor, Toast } from '@/components/ui';
import { RuleTypeSelector } from '@/components/rules';
import { FormularioNormativa, montarHtmlNormativa, htmlParaSecoes } from '@/components/rules/FormularioNormativa';
import { AuthGuard } from '@/components/auth';
import type { Department, RuleType, RuleStatus, Rule, NormativaSecoes, RuleVersion } from '@/types';

export default function EditRulePage() {
  return (
    <AuthGuard requireAdmin>
      <EditRuleContent />
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

function EditRuleContent() {
  const params = useParams();
  const ruleId = params.id as string;

  const [rule, setRule] = useState<Rule | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RuleType>('normativa');
  const [status, setStatus] = useState<RuleStatus>('vigente');
  const [departmentId, setDepartmentId] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [replacedById, setReplacedById] = useState('');
  const [secoes, setSecoes] = useState<NormativaSecoes>(secoesVazias);
  const [vigenciaInicio, setVigenciaInicio] = useState('');
  const [vigenciaFim, setVigenciaFim] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [allRules, setAllRules] = useState<Rule[]>([]);
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [ruleId]);

  const fetchData = async () => {
    setFetching(true);

    const [ruleResult, depsResult, rulesResult] = await Promise.all([
      rulesService.getById(ruleId),
      departmentsService.getAll(),
      rulesService.getAll(),
    ]);

    if (ruleResult.data) {
      const r = ruleResult.data;
      setRule(r);
      setTitle(r.title);
      setType(r.type);
      setStatus(r.status || 'vigente');
      setDepartmentId(r.department_id || '');
      setContent(r.content || '');
      setVideoUrl(r.video_url || '');
      setReplacedById(r.replaced_by_id || '');
      setVigenciaInicio(r.vigencia_inicio || '');
      setVigenciaFim(r.vigencia_fim || '');

      if (r.type === 'normativa' && r.content) {
        setSecoes(htmlParaSecoes(r.content));
      }
    }

    setDepartments(depsResult.data);
    setAllRules(rulesResult.data.filter((r: Rule) => r.id !== ruleId));

    const { data: vers } = await rulesService.getVersions(ruleId);
    setVersions(vers);

    setFetching(false);
  };

  const setorSelecionado = departments.find((d) => d.id === departmentId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let conteudoFinal = content;

    if (type === 'normativa') {
      conteudoFinal = montarHtmlNormativa(
        title,
        rule?.codigo_wn ?? 'WN000',
        setorSelecionado?.name ?? '',
        vigenciaInicio,
        vigenciaFim,
        secoes
      );
    }

    const { success, error } = await rulesService.update(ruleId, {
      title,
      content: conteudoFinal,
      type,
      status,
      department_id: type !== 'me_consulte' ? departmentId : null,
      video_url: videoUrl || null,
      replaced_by_id: status === 'obsoleta' && replacedById ? replacedById : null,
      vigencia_inicio: type === 'normativa' ? vigenciaInicio || null : null,
      vigencia_fim: type === 'normativa' ? vigenciaFim || null : null,
    });

    if (success) {
      setToast({ open: true, message: 'Artigo atualizado com sucesso!', variant: 'success' });
      setTimeout(() => router.push('/admin/rules'), 1500);
    } else {
      setToast({ open: true, message: error || 'Erro ao atualizar o artigo.', variant: 'error' });
    }

    setLoading(false);
  };

  const departmentOptions = departments.map((dep) => ({
    value: dep.id,
    label: dep.name,
  }));

  const replacementRuleOptions = allRules.map((r) => ({
    value: r.id,
    label: r.title,
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
            <div className="w-14 h-14 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">Editar Artigo</h1>
              <p className="text-[var(--color-text-muted)] text-sm">
                Atualize as informações do artigo existente.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Informações Básicas */}
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
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <Select
                      label="Departamento Responsável"
                      required
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      options={departmentOptions}
                      placeholder="Selecione o setor responsável..."
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Status do Documento */}
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
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 bg-[var(--color-bg-white)]'
                      }`}
                    >
                      <Icon size={24} className={option.color} />
                      <p className={`mt-2 font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {option.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              {status === 'obsoleta' && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-3">
                    <LinkIcon size={18} className="text-red-500" />
                    <span className="font-medium text-red-700">Documento Substituto</span>
                  </div>
                  <Select
                    label=""
                    value={replacedById}
                    onChange={(e) => setReplacedById(e.target.value)}
                    options={replacementRuleOptions}
                    placeholder="Selecione o documento que substitui este..."
                  />
                  <p className="text-xs text-red-600 mt-2">
                    Quando um documento é marcado como obsoleto, é recomendado indicar qual documento o substitui.
                  </p>
                </div>
              )}
            </section>

            {/* Conteúdo — estruturado para normativa, livre para outros tipos */}
            <section>
              <h2 className="text-lg font-semibold text-[var(--color-primary-dark)] mb-4">
                Conteúdo do Artigo
              </h2>

              {type === 'normativa' ? (
                <FormularioNormativa
                  secoes={secoes}
                  onChange={setSecoes}
                  codigoWn={rule.codigo_wn ?? (departmentId ? `WN${setorSelecionado?.name.substring(0, 3).toUpperCase()}###` : '')}
                  vigenciaInicio={vigenciaInicio}
                  vigenciaFim={vigenciaFim}
                  onVigenciaInicioChange={setVigenciaInicio}
                  onVigenciaFimChange={setVigenciaFim}
                />
              ) : (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Escreva o conteúdo do artigo aqui..."
                />
              )}
            </section>

            {/* Mídia */}
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
            </section>

            {/* Histórico de versões */}
            {versions.length > 0 && (
              <section>
                <button
                  type="button"
                  onClick={() => setVersionsOpen(v => !v)}
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <History size={16} />
                  Histórico de versões ({versions.length})
                  {versionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {versionsOpen && (
                  <div className="mt-3 border border-[var(--color-border)] rounded-xl overflow-hidden">
                    {versions.map((v, i) => (
                      <div key={v.id} className={`flex items-center justify-between px-4 py-3 text-sm ${i !== versions.length - 1 ? 'border-b border-[var(--color-border-light)]' : ''}`}>
                        <div>
                          <span className="font-medium text-[var(--color-text-primary)]">v{v.version_number}</span>
                          <span className="text-[var(--color-text-muted)] ml-3">{v.title}</span>
                        </div>
                        <span className="text-xs text-[var(--color-text-light)]">
                          {new Date(v.edited_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Ações */}
            <div className="pt-6 border-t border-[var(--color-border-light)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/admin/rules')}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium transition-colors"
              >
                Cancelar
              </button>
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

      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />
    </div>
  );
}
