'use client';

import { useEffect, useState } from 'react';
import { Pin, Bell } from 'lucide-react';
import { EmployeeLayout, PageHeader } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { avisosService } from '@/services';
import type { Aviso } from '@/services';

export default function AvisosPage() {
  return (
    <AuthGuard>
      <AvisosContent />
    </AuthGuard>
  );
}

function AvisosContent() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      avisosService.getAll(),
      avisosService.getReadIds(),
    ]).then(([{ data }, ids]) => {
      setAvisos(data);
      setReadIds(new Set(ids));
      setLoading(false);
      data.forEach(a => {
        if (!ids.includes(a.id)) avisosService.markRead(a.id);
      });
    });
  }, []);

  return (
    <EmployeeLayout>
      <PageHeader title="Mural de Avisos" description="Comunicados e avisos da empresa" />

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {loading ? (
          <LoadingSpinner message="Carregando avisos..." />
        ) : avisos.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} className="text-gray-300" />}
            title="Nenhum aviso no momento"
            description="Os comunicados da empresa aparecerão aqui."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {avisos.map((aviso) => {
              const isNew = !readIds.has(aviso.id);
              const autorNome = aviso.autor?.full_name ?? 'WinAudio';
              const iniciais = autorNome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

              return (
                <div
                  key={aviso.id}
                  className={`bg-[var(--color-bg-white)] rounded-2xl border shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                    aviso.fixado
                      ? 'border-[var(--color-primary)]/40'
                      : 'border-[var(--color-border-light)]'
                  }`}
                >
                  {/* Topo colorido se fixado */}
                  {aviso.fixado && (
                    <div className="h-1 bg-[var(--color-primary)]" />
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Autor + badges */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-border-light)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[var(--color-primary)]">{iniciais}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{autorNome}</p>
                        <time className="text-[11px] text-[var(--color-text-light)]">
                          {new Date(aviso.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </time>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {aviso.fixado && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded-full">
                            <Pin size={9} />
                            Fixado
                          </span>
                        )}
                        {isNew && (
                          <span className="text-[10px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">
                            Novo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Separador */}
                    <hr className="border-[var(--color-border-light)] mb-4" />

                    {/* Título */}
                    <h2 className="text-base font-bold text-[var(--color-primary-dark)] mb-3 leading-snug">
                      {aviso.titulo}
                    </h2>

                    {/* Conteúdo */}
                    <div
                      className="prose prose-sm max-w-none text-[var(--color-text-secondary)] leading-relaxed flex-1 line-clamp-6"
                      dangerouslySetInnerHTML={{ __html: aviso.conteudo }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
