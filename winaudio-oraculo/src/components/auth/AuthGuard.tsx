'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    if (requireAdmin && profile?.role !== 'admin_global' && profile?.role !== 'gestor_setor') {
      router.push('/normas');
    }
  }, [isLoading, isAuthenticated, profile, requireAdmin, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center">
        <LoadingSpinner message="Verificando autenticação..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
