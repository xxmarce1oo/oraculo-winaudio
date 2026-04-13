'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar, 
  Building, 
  Hash, 
  Printer,
  FileText,
  BookOpen,
  Globe,
  HelpCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { rulesService } from '@/services';
import { LoadingSpinner } from '@/components/ui';
import { AuthGuard } from '@/components/auth';
import type { Rule, RuleType, RuleStatus } from '@/types';
import { RULE_TYPE_LABELS, RULE_STATUS_LABELS } from '@/types';

const typeConfig: Record<RuleType, { icon: React.ElementType; color: string; bgColor: string }> = {
  normativa: { icon: BookOpen, color: 'var(--color-primary)', bgColor: 'var(--color-primary)' },
  procedimentos: { icon: FileText, color: 'var(--color-secondary)', bgColor: 'var(--color-secondary)' },
  me_consulte: { icon: Globe, color: '#f59e0b', bgColor: '#f59e0b' },
  faq: { icon: HelpCircle, color: '#10b981', bgColor: '#10b981' },
};

function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return null;
}

export default function NormativaArticlePage() {
  return (
    <AuthGuard>
      <ArticleContent />
    </AuthGuard>
  );
}

function ArticleContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRule() {
      setLoading(true);
      const { data, error: fetchError } = await rulesService.getById(id);
      
      if (fetchError || !data) {
        setError('Documento não encontrado.');
      } else {
        setRule(data);
      }
      setLoading(false);
    }

    if (id) {
      fetchRule();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <LoadingSpinner message="Carregando documento..." />
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center gap-4">
        <FileText size={48} className="text-gray-300" />
        <p className="text-[var(--color-text-muted)]">{error || 'Documento não encontrado.'}</p>
        <button
          onClick={() => router.push('/normas')}
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Voltar para Normas
        </button>
      </div>
    );
  }

  const config = typeConfig[rule.type];
  const Icon = config.icon;
  const departmentName = rule.type === 'me_consulte' 
    ? 'Todos os Setores' 
    : rule.departments?.[0]?.name || 'Não definido';
  
  const videoEmbedUrl = rule.video_url ? getVideoEmbedUrl(rule.video_url) : null;
  const readingTime = rule.reading_time_minutes || Math.max(1, Math.ceil((rule.content?.split(/\s+/).length || 0) / 200));
  const updatedDate = rule.updated_at || rule.created_at;

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] font-sans">
      {/* Status Banners */}
      {rule.status === 'obsoleta' && (
        <div className="bg-red-600 text-white print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <XCircle size={20} />
                <div>
                  <p className="font-semibold">Este documento está obsoleto</p>
                  <p className="text-sm text-red-100">
                    Este artigo foi descontinuado e não deve mais ser utilizado como referência.
                  </p>
                </div>
              </div>
              {rule.replaced_by_id && (
                <Link
                  href={`/normativas/${rule.replaced_by_id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors text-sm whitespace-nowrap"
                >
                  Ver documento atual
                  <ExternalLink size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {rule.status === 'atualizacao_recente' && (
        <div className="bg-amber-500 text-white print:hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              <div>
                <p className="font-semibold">Atualização Recente</p>
                <p className="text-sm text-amber-100">
                  Este documento foi atualizado recentemente. Revise as alterações com atenção.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[var(--color-bg-white)] border-b border-[var(--color-border)] sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/normas"
              className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Voltar para Normas</span>
              <span className="sm:hidden">Voltar</span>
            </Link>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-muted)] rounded-xl transition-all"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6 print:hidden">
          <Link href="/normas" className="hover:text-[var(--color-primary)] transition-colors">
            Normas
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: config.color }}>{RULE_TYPE_LABELS[rule.type]}</span>
          <ChevronRight size={14} />
          <span className="text-[var(--color-text-secondary)] truncate max-w-[200px]">
            {rule.title}
          </span>
        </nav>

        {/* Video Section */}
        {videoEmbedUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg print:hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={videoEmbedUrl}
                title="Vídeo do artigo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Article Card */}
        <article className="bg-[var(--color-bg-white)] rounded-3xl shadow-sm border border-[var(--color-border-light)] overflow-hidden">
          {/* Article Header */}
          <div className="p-6 sm:p-8 border-b border-[var(--color-border-light)]">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${config.bgColor}15`, color: config.color }}
              >
                <Icon size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${config.bgColor}15`, color: config.color }}
                  >
                    <Icon size={12} />
                    {RULE_TYPE_LABELS[rule.type]}
                  </span>
                  {rule.status === 'obsoleta' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                      <XCircle size={12} />
                      Obsoleto
                    </span>
                  )}
                  {rule.status === 'atualizacao_recente' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
                      <AlertTriangle size={12} />
                      Atualizado
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary-dark)] leading-tight">
                  {rule.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Metadata Bar */}
          <div className="px-6 sm:px-8 py-4 bg-[var(--color-bg-muted)]/50 border-b border-[var(--color-border-light)]">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Clock size={16} />
                <span>
                  <span className="text-[var(--color-text-secondary)] font-medium">
                    {readingTime} min
                  </span>
                  {' '}de leitura
                </span>
              </div>

              <div className="hidden sm:block w-px h-4 bg-[var(--color-border)]" />

              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Calendar size={16} />
                <span>
                  Atualizado em{' '}
                  <span className="text-[var(--color-text-secondary)] font-medium">
                    {new Date(updatedDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>

              <div className="hidden sm:block w-px h-4 bg-[var(--color-border)]" />

              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Building size={16} />
                <span>
                  <span className="text-[var(--color-text-secondary)] font-medium">
                    {departmentName}
                  </span>
                </span>
              </div>

              <div className="hidden sm:block w-px h-4 bg-[var(--color-border)]" />

              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Hash size={16} />
                <span className="font-mono text-xs text-[var(--color-text-light)]">
                  {rule.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div 
              className="prose prose-slate prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: rule.content || '<p>Sem conteúdo disponível.</p>' }}
            />
          </div>

          {/* Article Footer */}
          <div className="px-6 sm:px-8 py-6 bg-[var(--color-bg-muted)]/30 border-t border-[var(--color-border-light)] print:hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[var(--color-text-light)]">
                Este documento faz parte da base de conhecimento WinAudio.
              </p>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
              >
                <Printer size={18} />
                Imprimir Documento
              </button>
            </div>
          </div>
        </article>

        {/* Back Link */}
        <div className="mt-8 text-center print:hidden">
          <Link
            href="/normas"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar para a listagem de normas
          </Link>
        </div>
      </main>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          article {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
