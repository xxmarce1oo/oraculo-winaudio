'use client';

import { useEffect, useState } from 'react';
import { FileText, Users, Bell, CalendarDays, BookOpen, Clock, Activity, UserPlus } from 'lucide-react';
import { AdminLayout } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { LoadingSpinner } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  return (
    <AuthGuard requireAdmin>
      <DashboardContent />
    </AuthGuard>
  );
}

interface FeedItem {
  id: string;
  tipo: 'norma' | 'aviso' | 'usuario';
  descricao: string;
  data: string;
}

interface Stats {
  totalNormas: number;
  totalUsuarios: number;
  totalAvisos: number;
  agendamentosHoje: number;
  normasRecentes: { id: string; title: string; type: string; created_at: string }[];
  avisosRecentes: { id: string; titulo: string; criado_em: string; fixado: boolean }[];
  agendamentosProximos: { id: string; titulo: string; sala: string; inicio: string; responsavel_nome: string }[];
  feed: FeedItem[];
}

function DashboardContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createSupabaseBrowserClient();
      const hoje = new Date();
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString();
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59).toISOString();

      const [
        { count: totalNormas },
        { count: totalUsuarios },
        { count: totalAvisos },
        { count: agendamentosHoje },
        { data: normasRecentes },
        { data: avisosRecentes },
        { data: agendamentosProximos },
        { data: normasFeed },
        { data: avisosFeed },
        { data: usuariosFeed },
      ] = await Promise.all([
        supabase.from('rules').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('avisos').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('agendamentos').select('*', { count: 'exact', head: true }).eq('cancelado', false).gte('inicio', inicioHoje).lte('inicio', fimHoje),
        supabase.from('rules').select('id, title, type, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('avisos').select('id, titulo, criado_em, fixado').eq('ativo', true).order('criado_em', { ascending: false }).limit(4),
        supabase.from('agendamentos').select('id, titulo, sala, inicio, responsavel_nome').eq('cancelado', false).gte('inicio', new Date().toISOString()).order('inicio', { ascending: true }).limit(5),
        supabase.from('rules').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('avisos').select('id, titulo, criado_em').order('criado_em', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      // Monta feed unificado e ordena por data
      const feed: FeedItem[] = [
        ...(normasFeed ?? []).map((n: any) => ({
          id: n.id,
          tipo: 'norma' as const,
          descricao: `Norma publicada: "${n.title}"`,
          data: n.created_at,
        })),
        ...(avisosFeed ?? []).map((a: any) => ({
          id: a.id,
          tipo: 'aviso' as const,
          descricao: `Aviso publicado: "${a.titulo}"`,
          data: a.criado_em,
        })),
        ...(usuariosFeed ?? []).map((u: any) => ({
          id: u.id,
          tipo: 'usuario' as const,
          descricao: `Novo colaborador: ${u.full_name ?? 'Sem nome'}`,
          data: u.created_at,
        })),
      ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 10);

      setStats({
        totalNormas: totalNormas ?? 0,
        totalUsuarios: totalUsuarios ?? 0,
        totalAvisos: totalAvisos ?? 0,
        agendamentosHoje: agendamentosHoje ?? 0,
        normasRecentes: (normasRecentes ?? []) as Stats['normasRecentes'],
        avisosRecentes: (avisosRecentes ?? []) as Stats['avisosRecentes'],
        agendamentosProximos: (agendamentosProximos ?? []) as Stats['agendamentosProximos'],
        feed,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const TYPE_LABELS: Record<string, string> = {
    normativa: 'Normativa',
    procedimentos: 'Procedimento',
    me_consulte: 'Me Consulte',
    faq: 'FAQ',
  };

  const SALA_LABELS: Record<string, string> = {
    reuniao: 'Reunião',
    treinamento: 'Treinamento',
    diretoria: 'Diretoria',
  };

  const FEED_CONFIG = {
    norma: { icon: FileText, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' },
    aviso: { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    usuario: { icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  };

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const nomeExibido = profile?.full_name?.split(' ')[0] ?? 'Gestor';

  return (
    <AdminLayout>
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Saudação */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">{saudacao}, {nomeExibido} 👋</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando dashboard..." />
        ) : stats && (
          <>
            {/* Cards de métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Normas publicadas', value: stats.totalNormas, icon: FileText, color: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10', href: '/admin/rules' },
                { label: 'Colaboradores', value: stats.totalUsuarios, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-500/10', href: '/admin/users' },
                { label: 'Avisos ativos', value: stats.totalAvisos, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-500/10', href: '/admin/avisos' },
                { label: 'Agendamentos hoje', value: stats.agendamentosHoje, icon: CalendarDays, color: 'text-violet-600', bg: 'bg-violet-500/10', href: '/admin/salas' },
              ].map(({ label, value, icon: Icon, color, bg, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="bg-white rounded-2xl border border-[var(--color-border-light)] p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={22} className={color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-primary-dark)]">{value}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Grid principal: 3 colunas + feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Normas recentes */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-light)] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[var(--color-primary)]" />
                    <h2 className="text-sm font-semibold text-[var(--color-primary-dark)]">Normas Recentes</h2>
                  </div>
                  <button onClick={() => router.push('/admin/rules')} className="text-xs text-[var(--color-primary)] hover:underline">Ver todas</button>
                </div>
                <div className="divide-y divide-[var(--color-border-light)]">
                  {stats.normasRecentes.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] p-5">Nenhuma norma ainda.</p>
                  ) : stats.normasRecentes.map(n => (
                    <div key={n.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={13} className="text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{n.title}</p>
                        <p className="text-xs text-[var(--color-text-light)]">{TYPE_LABELS[n.type] ?? n.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avisos ativos */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-light)] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-amber-500" />
                    <h2 className="text-sm font-semibold text-[var(--color-primary-dark)]">Avisos Ativos</h2>
                  </div>
                  <button onClick={() => router.push('/admin/avisos')} className="text-xs text-[var(--color-primary)] hover:underline">Gerenciar</button>
                </div>
                <div className="divide-y divide-[var(--color-border-light)]">
                  {stats.avisosRecentes.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] p-5">Nenhum aviso ativo.</p>
                  ) : stats.avisosRecentes.map(a => (
                    <div key={a.id} className="px-5 py-3 flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a.fixado ? 'bg-[var(--color-primary)]/10' : 'bg-amber-500/10'}`}>
                        <Bell size={13} className={a.fixado ? 'text-[var(--color-primary)]' : 'text-amber-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{a.titulo}</p>
                        <p className="text-xs text-[var(--color-text-light)]">
                          {new Date(a.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          {a.fixado && <span className="ml-2 text-[var(--color-primary)]">· Fixado</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Próximos agendamentos */}
              <div className="bg-white rounded-2xl border border-[var(--color-border-light)] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border-light)]">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-violet-600" />
                    <h2 className="text-sm font-semibold text-[var(--color-primary-dark)]">Próximos Agendamentos</h2>
                  </div>
                  <button onClick={() => router.push('/admin/salas')} className="text-xs text-[var(--color-primary)] hover:underline">Ver calendário</button>
                </div>
                <div className="divide-y divide-[var(--color-border-light)]">
                  {stats.agendamentosProximos.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] p-5">Nenhum agendamento próximo.</p>
                  ) : stats.agendamentosProximos.map(ag => (
                    <div key={ag.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={13} className="text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{ag.titulo}</p>
                        <p className="text-xs text-[var(--color-text-light)]">
                          {SALA_LABELS[ag.sala] ?? ag.sala} · {new Date(ag.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {ag.responsavel_nome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feed de atividades */}
            <div className="bg-white rounded-2xl border border-[var(--color-border-light)] shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-border-light)]">
                <Activity size={16} className="text-[var(--color-primary)]" />
                <h2 className="text-sm font-semibold text-[var(--color-primary-dark)]">Atividades Recentes</h2>
              </div>
              {stats.feed.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] p-5">Nenhuma atividade registrada.</p>
              ) : (
                <div className="divide-y divide-[var(--color-border-light)]">
                  {stats.feed.map((item, idx) => {
                    const cfg = FEED_CONFIG[item.tipo];
                    const Icon = cfg.icon;
                    return (
                      <div key={`${item.id}-${idx}`} className="flex items-center gap-4 px-5 py-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon size={14} className={cfg.color} />
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] flex-1">{item.descricao}</p>
                        <time className="text-xs text-[var(--color-text-light)] flex-shrink-0">
                          {new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </time>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
