'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Filter, LayoutGrid, List, ChevronDown, ChevronUp, Building, Globe, ExternalLink, BookOpen, HelpCircle } from 'lucide-react';
import { rulesService } from '@/services';
import { EmployeeLayout, PageHeader } from '@/components/layout';
import { SearchInput, LoadingSpinner, EmptyState, Badge } from '@/components/ui';
import { RuleCard } from '@/components/rules';
import { AuthGuard } from '@/components/auth';
import type { Rule, RuleType } from '@/types';
import { RULE_TYPE_LABELS } from '@/types';

type FilterType = 'all' | RuleType;

const typeConfig: Record<RuleType, { icon: React.ElementType; variant: 'primary' | 'secondary' | 'warning' | 'success'; bgClass: string }> = {
  normativa: { icon: BookOpen, variant: 'primary', bgClass: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' },
  procedimentos: { icon: FileText, variant: 'secondary', bgClass: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]' },
  me_consulte: { icon: Globe, variant: 'warning', bgClass: 'bg-amber-500/10 text-amber-500' },
  faq: { icon: HelpCircle, variant: 'success', bgClass: 'bg-emerald-500/10 text-emerald-500' },
};
type ViewMode = 'list' | 'grid';

interface GroupedRules {
  [departmentName: string]: Rule[];
}

export default function NormasPage() {
  return (
    <AuthGuard>
      <NormasContent />
    </AuthGuard>
  );
}

function NormasContent() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    const { data } = await rulesService.getAll();
    setRules(data);
    setLoading(false);
  };

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || rule.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [rules, searchQuery, filterType]);

  const ruleStats = useMemo(() => {
    const normativa = rules.filter(r => r.type === 'normativa').length;
    const procedimentos = rules.filter(r => r.type === 'procedimentos').length;
    const meConsulte = rules.filter(r => r.type === 'me_consulte').length;
    const faq = rules.filter(r => r.type === 'faq').length;
    return { total: rules.length, normativa, procedimentos, meConsulte, faq };
  }, [rules]);

  const groupedRules = useMemo<GroupedRules>(() => {
    return filteredRules.reduce<GroupedRules>((acc, rule) => {
      const departmentName = rule.type === 'me_consulte' 
        ? 'Todos os Setores' 
        : rule.departments?.name || 'Sem Setor';
      
      if (!acc[departmentName]) {
        acc[departmentName] = [];
      }
      acc[departmentName].push(rule);
      return acc;
    }, {});
  }, [filteredRules]);

  const sortedSectorNames = useMemo(() => {
    return Object.keys(groupedRules).sort((a, b) => {
      if (a === 'Todos os Setores') return -1;
      if (b === 'Todos os Setores') return 1;
      return a.localeCompare(b, 'pt-BR');
    });
  }, [groupedRules]);

  const toggleSector = (sectorName: string) => {
    setExpandedSectors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectorName)) {
        newSet.delete(sectorName);
      } else {
        newSet.add(sectorName);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSectors(new Set(sortedSectorNames));
  };

  const collapseAll = () => {
    setExpandedSectors(new Set());
  };

  const filterButtons: { label: string; value: FilterType; count: number }[] = [
    { label: 'Todos', value: 'all', count: ruleStats.total },
    { label: 'Normativas', value: 'normativa', count: ruleStats.normativa },
    { label: 'Procedimentos', value: 'procedimentos', count: ruleStats.procedimentos },
    { label: 'Me Consulte', value: 'me_consulte', count: ruleStats.meConsulte },
    { label: 'FAQ', value: 'faq', count: ruleStats.faq },
  ];

  return (
    <EmployeeLayout>
      <PageHeader
        title="Normas e Políticas"
        description="Consulte as normativas da empresa. Clique em uma norma para ver os detalhes."
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SearchInput
                  placeholder="Buscar normas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80"
                />

                <div className="flex items-center bg-[var(--color-bg-white)] border border-[var(--color-border)] rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)]'
                    }`}
                    title="Visualização em lista"
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-[var(--color-primary)] text-white shadow-sm'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)]'
                    }`}
                    title="Visualização em cards"
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <div className="flex gap-2">
                  {filterButtons.map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setFilterType(btn.value)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-all
                        ${filterType === btn.value
                          ? 'bg-[var(--color-primary)] text-white shadow-md'
                          : 'bg-[var(--color-bg-white)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] border border-[var(--color-border)]'
                        }
                      `}
                    >
                      {btn.label}
                      <span className={`ml-1.5 ${filterType === btn.value ? 'text-white/70' : 'text-[var(--color-text-light)]'}`}>
                        ({btn.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sortedSectorNames.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors"
                >
                  Expandir todos
                </button>
                <span className="text-[var(--color-text-light)]">|</span>
                <button
                  onClick={collapseAll}
                  className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors"
                >
                  Recolher todos
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-64">
              <LoadingSpinner message="Carregando normas..." />
            </div>
          ) : filteredRules.length === 0 ? (
            <EmptyState
              icon={<FileText className="text-gray-300" size={32} />}
              title="Nenhuma norma encontrada"
              description={
                searchQuery
                  ? `Não encontramos normas com "${searchQuery}". Tente outro termo.`
                  : 'Não há normas cadastradas no momento.'
              }
            />
          ) : (
            <div className="space-y-4">
              {sortedSectorNames.map((sectorName) => {
                const sectorRules = groupedRules[sectorName];
                const isExpanded = expandedSectors.has(sectorName);

                return (
                  <div
                    key={sectorName}
                    className="bg-[var(--color-bg-white)] rounded-2xl border border-[var(--color-border-light)] overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleSector(sectorName)}
                      className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-[var(--color-bg-muted)]/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <Building size={20} className="text-[var(--color-primary)]" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-[var(--color-primary-dark)] group-hover:text-[var(--color-primary)] transition-colors">
                            {sectorName}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {sectorRules.length} {sectorRules.length === 1 ? 'norma' : 'normas'}
                          </p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-[var(--color-primary)]/10' : ''}`}>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-[var(--color-primary)]" />
                        ) : (
                          <ChevronDown size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[var(--color-border-light)]">
                        {viewMode === 'grid' ? (
                          <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sectorRules.map((rule) => (
                              <RuleCard
                                key={rule.id}
                                rule={rule}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="divide-y divide-[var(--color-border-light)]">
                            {sectorRules.map((rule) => (
                              <RuleListItem
                                key={rule.id}
                                rule={rule}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      </EmployeeLayout>
  );
}

interface RuleListItemProps {
  rule: Rule;
}

function RuleListItem({ rule }: RuleListItemProps) {
  const config = typeConfig[rule.type];
  const Icon = config.icon;

  return (
    <Link
      href={`/normativas/${rule.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 md:px-5 hover:bg-[var(--color-bg-muted)]/50 transition-colors group"
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgClass}`}
      >
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-[var(--color-primary-dark)] group-hover:text-[var(--color-primary)] transition-colors truncate">
          {rule.title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <Badge
            variant={config.variant}
            icon={<Icon size={10} />}
          >
            {RULE_TYPE_LABELS[rule.type]}
          </Badge>
          <span className="text-xs text-[var(--color-text-light)]">
            {new Date(rule.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      <ExternalLink
        size={18}
        className="text-[var(--color-text-light)] group-hover:text-[var(--color-primary)] transition-all flex-shrink-0"
      />
    </Link>
  );
}
