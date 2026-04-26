'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { profile, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (profile?.role === 'admin_global' || profile?.role === 'gestor_setor') {
      router.replace('/admin/rules');
    } else {
      router.replace('/normas');
    }
  }, [isLoading, isAuthenticated, profile, router]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
      <LoadingSpinner message="Carregando..." />
    </div>
  );
}
