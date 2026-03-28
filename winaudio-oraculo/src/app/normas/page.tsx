'use client';

import { useEffect, useState, useMemo } from 'react';
import { FileText, Filter } from 'lucide-react';
import { rulesService } from '@/services';
import { EmployeeLayout, PageHeader } from '@/components/layout';
import { SearchInput, LoadingSpinner, EmptyState } from '@/components/ui';
import { RuleCard, RuleDetailModal } from '@/components/rules';
import { AuthGuard } from '@/components/auth';
import type { Rule, RuleType } from '@/types';

type FilterType = 'all' | RuleType;

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
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

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
    const meConsulte = rules.filter(r => r.type === 'me_consulte').length;
    const oraculo = rules.filter(r => r.type === 'oraculo').length;
    return { total: rules.length, meConsulte, oraculo };
  }, [rules]);

  const handleRuleClick = (rule: Rule) => {
    setSelectedRule(rule);
  };

  const filterButtons: { label: string; value: FilterType; count: number }[] = [
    { label: 'Todas', value: 'all', count: ruleStats.total },
    { label: 'Me Consulte', value: 'me_consulte', count: ruleStats.meConsulte },
    { label: 'Oráculo', value: 'oraculo', count: ruleStats.oraculo },
  ];

  return (
    <EmployeeLayout>
      <PageHeader
        title="Normas e Políticas"
        description="Consulte as normativas da empresa. Clique em uma norma para ver os detalhes."
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <SearchInput
              placeholder="Buscar normas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80"
            />

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onClick={handleRuleClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RuleDetailModal
        rule={selectedRule}
        onClose={() => setSelectedRule(null)}
      />
    </EmployeeLayout>
  );
}
