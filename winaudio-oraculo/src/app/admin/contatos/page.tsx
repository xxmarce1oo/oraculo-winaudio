'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail, Users, X } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { Button, Input, LoadingSpinner, EmptyState, Dialog, Toast, SearchInput } from '@/components/ui';
import { contatosService } from '@/services/contatos.service';
import type { Contato, ContatoFormData } from '@/services/contatos.service';

export default function AdminContatosPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContatosContent />
    </AuthGuard>
  );
}

const EMPTY_FORM: ContatoFormData = {
  nome: '',
  setor: 'Geral',
  telefones: [''],
  emails: [''],
  descricao: '',
};

function AdminContatosContent() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('Todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ContatoFormData>(EMPTY_FORM);
  const [salvando, setSalvando] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  useEffect(() => { fetchContatos(); }, []);

  const fetchContatos = async () => {
    setLoading(true);
    const { data } = await contatosService.getAll();
    setContatos(data);
    setLoading(false);
  };

  const setores = useMemo(() => {
    const s = [...new Set(contatos.map(c => c.setor))].sort();
    return ['Todos', ...s];
  }, [contatos]);

  const filtrados = useMemo(() => {
    return contatos.filter(c => {
      const matchSetor = filtroSetor === 'Todos' || c.setor === filtroSetor;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.nome.toLowerCase().includes(q) ||
        c.emails.some(e => e.toLowerCase().includes(q)) ||
        c.telefones.some(t => t.includes(q));
      return matchSetor && matchSearch;
    });
  }, [contatos, search, filtroSetor]);

  const abrirCriar = () => {
    setEditandoId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const abrirEditar = (c: Contato) => {
    setEditandoId(c.id);
    setForm({
      nome: c.nome,
      setor: c.setor,
      telefones: c.telefones.length > 0 ? c.telefones : [''],
      emails: c.emails.length > 0 ? c.emails : [''],
      descricao: c.descricao ?? '',
    });
    setModalOpen(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setToast({ open: true, message: 'O nome é obrigatório.', variant: 'error' });
      return;
    }
    setSalvando(true);
    const payload: ContatoFormData = {
      ...form,
      telefones: form.telefones.filter(t => t.trim()),
      emails: form.emails.filter(e => e.trim()),
    };
    const result = editandoId
      ? await contatosService.update(editandoId, payload)
      : await contatosService.create(payload);
    setSalvando(false);
    if (result.success) {
      setModalOpen(false);
      fetchContatos();
      setToast({ open: true, message: editandoId ? 'Contato atualizado!' : 'Contato criado!', variant: 'success' });
    } else {
      setToast({ open: true, message: result.error || 'Erro ao salvar.', variant: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const { success, error } = await contatosService.delete(deleteId);
    setDeleteId(null);
    if (success) { fetchContatos(); setToast({ open: true, message: 'Contato excluído.', variant: 'success' }); }
    else setToast({ open: true, message: error || 'Erro ao excluir.', variant: 'error' });
  };

  // Helpers para campos dinâmicos
  const addField = (field: 'telefones' | 'emails') =>
    setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const removeField = (field: 'telefones' | 'emails', idx: number) =>
    setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  const updateField = (field: 'telefones' | 'emails', idx: number, val: string) =>
    setForm(f => ({ ...f, [field]: f[field].map((v, i) => i === idx ? val : v) }));

  return (
    <AdminLayout>
      <PageHeader
        title="Contatos"
        description="Agenda de contatos e fornecedores da empresa."
        actions={<Button icon={<Plus size={18} />} onClick={abrirCriar}>Novo Contato</Button>}
      />

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <SearchInput
            placeholder="Buscar contato..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-72"
          />
          <div className="flex gap-2 flex-wrap">
            {setores.map(s => (
              <button
                key={s}
                onClick={() => setFiltroSetor(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  filtroSetor === s
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando contatos..." />
        ) : filtrados.length === 0 ? (
          <EmptyState
            icon={<Users size={32} className="text-gray-300" />}
            title="Nenhum contato cadastrado"
            description="Adicione contatos para que a equipe possa consultá-los."
            action={<button onClick={abrirCriar} className="text-[var(--color-primary)] font-semibold text-sm hover:underline">Criar primeiro contato</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtrados.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-[var(--color-border-light)] p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[var(--color-primary)]">
                      {c.nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--color-primary-dark)] leading-tight truncate">{c.nome}</h3>
                    <span className="text-xs text-[var(--color-text-light)] bg-[var(--color-bg-muted)] px-2 py-0.5 rounded-full mt-1 inline-block">{c.setor}</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  {c.telefones.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Phone size={13} className="text-[var(--color-text-light)] mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        {c.telefones.map((t, i) => (
                          <a key={i} href={`tel:${t.replace(/\D/g, '')}`} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">{t}</a>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.emails.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Mail size={13} className="text-[var(--color-text-light)] mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        {c.emails.map((e, i) => (
                          <a key={i} href={`mailto:${e}`} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors truncate">{e}</a>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.descricao && (
                    <p className="text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border-light)] mt-2 line-clamp-2">{c.descricao}</p>
                  )}
                </div>

                <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-[var(--color-border-light)]">
                  <button onClick={() => abrirEditar(c)} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] px-2 py-1 rounded-lg hover:bg-[var(--color-primary)]/5 transition-colors">
                    <Pencil size={13} /> Editar
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-[var(--color-bg-base)] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-4 px-8 py-6 border-b border-[var(--color-border-light)]">
              <div className="w-12 h-12 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-primary-dark)]">{editandoId ? 'Editar Contato' : 'Novo Contato'}</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Preencha as informações do contato.</p>
              </div>
            </div>

            <form onSubmit={handleSalvar} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                <Input label="Nome" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo ou empresa" />
                <Input label="Setor" value={form.setor} onChange={e => setForm(f => ({ ...f, setor: e.target.value }))} placeholder="Ex: Geral, Financeiro, TI..." />

                {/* Telefones dinâmicos */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Telefones</label>
                  <div className="space-y-2">
                    {form.telefones.map((t, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={t}
                          onChange={e => updateField('telefones', i, e.target.value)}
                          placeholder="(41) 99999-9999"
                          className="flex-1 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                        />
                        {form.telefones.length > 1 && (
                          <button type="button" onClick={() => removeField('telefones', i)} className="p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] hover:text-red-500 hover:border-red-300 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addField('telefones')} className="text-xs text-[var(--color-primary)] hover:underline font-medium">
                      + Adicionar telefone
                    </button>
                  </div>
                </div>

                {/* Emails dinâmicos */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Emails</label>
                  <div className="space-y-2">
                    {form.emails.map((e, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="email"
                          value={e}
                          onChange={ev => updateField('emails', i, ev.target.value)}
                          placeholder="email@exemplo.com"
                          className="flex-1 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                        />
                        {form.emails.length > 1 && (
                          <button type="button" onClick={() => removeField('emails', i)} className="p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-light)] hover:text-red-500 hover:border-red-300 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addField('emails')} className="text-xs text-[var(--color-primary)] hover:underline font-medium">
                      + Adicionar email
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">Descrição <span className="font-normal text-[var(--color-text-light)]">(opcional)</span></label>
                  <textarea
                    value={form.descricao ?? ''}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    placeholder="Cargo, função, observações..."
                    rows={3}
                    className="w-full border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 px-8 py-5 border-t border-[var(--color-border-light)]">
                <button type="button" onClick={() => setModalOpen(false)} className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-4 py-2 transition-colors">
                  Cancelar
                </button>
                <Button type="submit" size="md" loading={salvando} icon={<Users size={16} />}>
                  {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Criar Contato'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Dialog open={!!deleteId} variant="danger" title="Excluir contato" message="Esta ação não pode ser desfeita." confirmLabel="Excluir" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
      <Toast open={toast.open} message={toast.message} variant={toast.variant} onClose={() => setToast(t => ({ ...t, open: false }))} />
    </AdminLayout>
  );
}
