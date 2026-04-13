'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';
import { LoadingSpinner } from '@/components/ui';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSessionAndRedirect() {
      try {
        const user = await authService.getCurrentUser();

        if (!user) {
          router.replace('/login');
          return;
        }

        const profile = await authService.getUserProfile();

        if (profile?.role === 'admin_global' || profile?.role === 'gestor_setor') {
          router.replace('/admin/rules');
        } else {
          router.replace('/normas');
        }
      } catch {
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    }

    checkSessionAndRedirect();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center">
        <LoadingSpinner message="Verificando sessão..." />
      </div>
    );
  }

  return null;
}
