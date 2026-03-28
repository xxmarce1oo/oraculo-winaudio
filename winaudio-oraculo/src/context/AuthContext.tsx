'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/services';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { UserProfile } from '@/services/auth.service';

interface AuthContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const userProfile = await authService.getUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    // 1. Carrega o perfil inicial quando o site abre
    loadProfile();

    // 2. O Segredo: Fica escutando qualquer mudança de login/logout em tempo real
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadProfile(); // Se logou, busca o perfil na mesma hora
      } else if (event === 'SIGNED_OUT') {
        setProfile(null); // Se saiu, limpa a memória
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!profile;

  return (
    <AuthContext.Provider value={{ profile, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}