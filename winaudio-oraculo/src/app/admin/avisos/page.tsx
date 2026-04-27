'use client';

import { useEffect, useState } from 'react';
import { Plus, Pin, PinOff, Archive, Bell } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { Button, Input, LoadingSpinner, EmptyState, Dialog, Toast, RichTextEditor } from '@/components/ui';
import { avisosService } from '@/services';
import type { Aviso } from '@/services';

export default function AdminAvisosPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminAvisosContent />
    </AuthGuard>
  );
}

function AdminAvisosContent() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoOpen, setNovoOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [fixado, setFixado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  useEffect(() => { fetchAvisos(); }, []);

  const fetchAvisos = async () => {
    setLoading(true);
    const { data } = await avisosService.getAll();
    setAvisos(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo || conteudo === '<p></p>') {
      setToast({ open: true, message: 'O conteúdo não pode estar vazio.', variant: 'error' });
      return;
    }
    setSalvando(true);
    const { success, error } = await avisosService.create({ titulo, conteudo, fixado });
    setSalvando(false);
    if (success) {
      setNovoOpen(false);
      setTitulo(''); setConteudo(''); setFixado(false);
      fetchAvisos();
      setToast({ open: true, message: 'Aviso publicado!', variant: 'success' });
    } else {
      setToast({ open: true, message: error || 'Erro ao publicar aviso.', variant: 'error' });
    }
  };

  const handleToggleFixado = async (aviso: Aviso) => {
    await avisosService.toggleFixado(aviso.id, !aviso.fixado);
    fetchAvisos();
  };

  const handleArchiveConfirm = async () => {
    if (!archiveId) return;
    const { success, error } = await avisosService.archive(archiveId);
    setArchiveId(null);
    if (success) {
      fetchAvisos();
      setToast({ open: true, message: 'Aviso arquivado.', variant: 'success' });
    } else {
      setToast({ open: true, message: error || 'Erro ao arquivar.', variant: 'error' });
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Mural de Avisos"
        description="Gerencie os comunicados exibidos para todos os colaboradores."
        actions={
          <Button icon={<Plus size={18} />} onClick={() => setNovoOpen(true)}>
            Novo Aviso
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {loading ? (
          <LoadingSpinner message="Carregando avisos..." />
        ) : avisos.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} className="text-gray-300" />}
            title="Nenhum aviso publicado"
            description="Crie um aviso para que os colaboradores vejam na página de comunicados."
            action={
              <button onClick={() => setNovoOpen(true)} className="text-[var(--color-primary)] font-semibold text-sm hover:underline">
                Criar primeiro aviso
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {avisos.map((aviso) => (
              <div
                key={aviso.id}
                className={`bg-[var(--color-bg-white)] rounded-2xl border shadow-sm flex flex-col overflow-hidden group transition-shadow hover:shadow-md ${
                  aviso.fixado ? 'border-[var(--color-primary)]/40' : 'border-[var(--color-border-light)]'
                }`}
              >
                {aviso.fixado && <div className="h-1 bg-[var(--color-primary)]" />}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        aviso.fixado ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-light)]'
                      }`}>
                        <Bell size={15} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--color-primary-dark)] text-sm leading-tight">{aviso.titulo}</h3>
                        <p className="text-[11px] text-[var(--color-text-light)] mt-0.5">
                          {new Date(aviso.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {aviso.fixado && (
                      <span className="text-[10px] font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Fixado
                      </span>
                    )}
                  </div>

                  <div
                    className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed flex-1"
                    dangerouslySetInnerHTML={{ __html: aviso.conteudo }}
                  />

                  <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-[var(--color-border-light)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleFixado(aviso)}
                      title={aviso.fixado ? 'Desafixar' : 'Fixar'}
                      className="p-1.5 rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {aviso.fixado ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                      onClick={() => setArchiveId(aviso.id)}
                      title="Arquivar"
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-light)] hover:text-red-500 transition-colors"
                    >
                      <Archive size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo aviso */}
      {novoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNovoOpen(false)} />
          <div className="relative bg-[var(--color-bg-base)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-4 px-8 py-6 border-b border-[var(--color-border-light)]">
              <div className="w-12 h-12 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">Novo Aviso</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Será exibido para todos os colaboradores no mural.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                <Input
                  label="Título do Aviso"
                  required
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Reunião geral na sexta-feira às 14h"
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">
                    Conteúdo <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <RichTextEditor
                    content={conteudo}
                    onChange={setConteudo}
                    placeholder="Descreva o comunicado em detalhes."
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] transition-colors">
                  <input
                    type="checkbox"
                    checked={fixado}
                    onChange={e => setFixado(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--color-primary)]"
                  />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">Fixar aviso no topo</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Aviso fixado sempre aparece primeiro na lista</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 px-8 py-5 border-t border-[var(--color-border-light)]">
                <button
                  type="button"
                  onClick={() => setNovoOpen(false)}
                  className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-4 py-2 transition-colors"
                >
                  Cancelar
                </button>
                <Button type="submit" size="md" loading={salvando} icon={<Bell size={16} />}>
                  {salvando ? 'Publicando...' : 'Publicar Aviso'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Dialog
        open={!!archiveId}
        variant="warning"
        title="Arquivar aviso"
        message="O aviso será removido do mural para todos os colaboradores."
        confirmLabel="Arquivar"
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveId(null)}
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
