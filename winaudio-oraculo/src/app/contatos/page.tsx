'use client';

import { useEffect, useState, useMemo } from 'react';
import { Phone, Mail, Search, Users, X } from 'lucide-react';
import { EmployeeLayout, PageHeader } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { LoadingSpinner, EmptyState, SearchInput } from '@/components/ui';
import { contatosService } from '@/services/contatos.service';
import type { Contato } from '@/services/contatos.service';

export default function ContatosPage() {
  return (
    <AuthGuard>
      <ContatosContent />
    </AuthGuard>
  );
}

function ContatosContent() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('Todos');

  useEffect(() => {
    contatosService.getAll().then(({ data }) => {
      setContatos(data);
      setLoading(false);
    });
  }, []);

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
        c.telefones.some(t => t.includes(q)) ||
        c.descricao?.toLowerCase().includes(q);
      return matchSetor && matchSearch;
    });
  }, [contatos, search, filtroSetor]);

  return (
    <EmployeeLayout>
      <PageHeader title="Contatos" description="Agenda de contatos da empresa" />

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <SearchInput
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-80"
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
            title="Nenhum contato encontrado"
            description="Nenhum contato corresponde à sua busca."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtrados.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-[var(--color-border-light)] p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Cabeçalho */}
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

                <div className="space-y-2">
                  {c.telefones.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Phone size={13} className="text-[var(--color-text-light)] mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        {c.telefones.map((t, i) => (
                          <a key={i} href={`tel:${t.replace(/\D/g, '')}`} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                            {t}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.emails.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Mail size={13} className="text-[var(--color-text-light)] mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col gap-0.5">
                        {c.emails.map((e, i) => (
                          <a key={i} href={`mailto:${e}`} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors truncate">
                            {e}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.descricao && (
                    <p className="text-xs text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border-light)] mt-2 line-clamp-2">
                      {c.descricao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
