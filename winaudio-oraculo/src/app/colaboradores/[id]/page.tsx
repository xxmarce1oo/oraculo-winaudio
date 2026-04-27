'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Building, Shield, User } from 'lucide-react';
import { AuthGuard } from '@/components/auth';
import { LoadingSpinner } from '@/components/ui';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const ROLE_LABELS: Record<string, string> = {
  admin_global: 'Administrador Global',
  gestor_setor: 'Gestor de Setor',
  employee: 'Colaborador',
};

interface PublicProfile {
  id: string;
  full_name: string | null;
  role: string;
  cargo: string | null;
  avatar_url: string | null;
  departments: { name: string } | null;
}

export default function ColaboradorPage() {
  return <AuthGuard><ColaboradorContent /></AuthGuard>;
}

function ColaboradorContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from('profiles')
      .select('id, full_name, role, cargo, avatar_url, departments(name)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setProfile(data as unknown as PublicProfile);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
      <LoadingSpinner message="Carregando perfil..." />
    </div>
  );

  if (notFound || !profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)]">
      <User size={48} className="text-gray-300" />
      <p className="text-[var(--color-text-muted)]">Colaborador não encontrado.</p>
      <button onClick={() => router.back()} className="text-[var(--color-primary)] font-medium flex items-center gap-2">
        <ArrowLeft size={16} /> Voltar
      </button>
    </div>
  );

  const iniciais = (profile.full_name ?? 'U').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const isAdmin = profile.role === 'admin_global' || profile.role === 'gestor_setor';

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:text-[var(--color-primary-dark)] transition-colors">
            <ArrowLeft size={18} /> Voltar
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl border border-[var(--color-border-light)] shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]" />

          {/* Avatar */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-[var(--color-primary)]/10 flex items-center justify-center overflow-hidden shadow-lg">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[var(--color-primary)]">{iniciais}</span>
                )}
              </div>
              {isAdmin && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full">
                  <Shield size={12} /> {ROLE_LABELS[profile.role]}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-1">
              {profile.full_name ?? 'Colaborador'}
            </h1>
            {profile.cargo && (
              <p className="text-[var(--color-text-secondary)] mb-4">{profile.cargo}</p>
            )}

            <div className="space-y-3 mt-6 pt-6 border-t border-[var(--color-border-light)]">
              {profile.departments?.name && (
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                  <Building size={16} className="text-[var(--color-text-light)]" />
                  <span>{profile.departments.name}</span>
                </div>
              )}
              {!isAdmin && (
                <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                  <User size={16} className="text-[var(--color-text-light)]" />
                  <span>{ROLE_LABELS[profile.role] ?? 'Colaborador'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
