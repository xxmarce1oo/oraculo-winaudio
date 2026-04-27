'use client';

import { useEffect, useState } from 'react';
import { X, BookOpen, FileText, Globe, HelpCircle, Calendar, Building, Clock } from 'lucide-react';
import { rulesService } from '@/services';
import { LoadingSpinner } from '@/components/ui';
import { RULE_TYPE_LABELS } from '@/types';
import type { Rule, RuleType } from '@/types';

const typeConfig: Record<RuleType, { icon: React.ElementType; color: string }> = {
  normativa: { icon: BookOpen, color: 'var(--color-primary)' },
  procedimentos: { icon: FileText, color: 'var(--color-secondary)' },
  me_consulte: { icon: Globe, color: '#f59e0b' },
  faq: { icon: HelpCircle, color: '#10b981' },
};

interface DrawerNormaProps {
  ruleId: string | null;
  onFechar: () => void;
}

export function DrawerNorma({ ruleId, onFechar }: DrawerNormaProps) {
  const [rule, setRule] = useState<Rule | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!ruleId) { setRule(null); return; }
    setCarregando(true);
    rulesService.getById(ruleId).then(({ data }) => {
      setRule(data);
      setCarregando(false);
    });
  }, [ruleId]);

  const aberto = !!ruleId;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${aberto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onFechar}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col transition-transform duration-300 ${aberto ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <span className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Norma</span>
          <button onClick={onFechar} className="p-2 rounded-xl hover:bg-[var(--color-bg-muted)] transition-colors">
            <X size={20} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {carregando && (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner message="Carregando norma..." />
            </div>
          )}

          {!carregando && rule && (() => {
            const config = typeConfig[rule.type];
            const Icon = config.icon;
            const departamento = rule.type === 'me_consulte' ? 'Todos os Setores' : (rule.departments as { name: string } | null)?.name || 'Não definido';
            const readingTime = rule.reading_time_minutes || 1;
            const updatedDate = rule.updated_at || rule.created_at;

            return (
              <>
                {/* Cabeçalho da norma */}
                <div className="px-6 py-6 border-b border-[var(--color-border)]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${config.color}18`, color: config.color }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                        style={{ backgroundColor: `${config.color}18`, color: config.color }}>
                        <Icon size={11} />
                        {RULE_TYPE_LABELS[rule.type]}
                      </span>
                      <h2 className="text-lg font-bold text-[var(--color-text-primary)] leading-snug">{rule.title}</h2>
                    </div>
                  </div>

                  {/* Metadados */}
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>{readingTime} min de leitura</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span>Atualizado em {new Date(updatedDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building size={13} />
                      <span>{departamento}</span>
                    </div>
                  </div>
                </div>

                {/* Conteúdo da norma */}
                <div className="px-6 py-6">
                  <div
                    className="prose prose-sm max-w-none text-[var(--color-text-primary)]"
                    dangerouslySetInnerHTML={{ __html: rule.content || '<p>Sem conteúdo disponível.</p>' }}
                  />
                </div>
              </>
            );
          })()}

          {!carregando && !rule && (
            <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
              Norma não encontrada.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
