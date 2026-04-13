'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { authService } from '@/services';
import { Input, Button, LoadingSpinner } from '@/components/ui';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/normas';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { user, error: authError } = await authService.login({ email, password });

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    if (user) {
      // Usar window.location.href em vez de router.push resolve de vez qualquer
      // problema de corrida de cache entre o Middleware e o React Context
      const profile = await authService.getUserProfile();
      if (profile?.role === 'admin_global' || profile?.role === 'gestor_setor') {
        window.location.href = '/admin/rules';
      } else {
        window.location.href = redirectTo;
      }
    }
  };

  return (
    <div className="max-w-4xl w-full bg-[var(--color-bg-white)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
      <LoginBranding />
      <LoginForm
        email={email}
        password={password}
        rememberMe={rememberMe}
        loading={loading}
        error={error}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onRememberMeChange={setRememberMe}
        onSubmit={handleLogin}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<LoadingSpinner message="Carregando portal..." />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}

function LoginBranding() {
  return (
    <div className="bg-[var(--color-primary-dark)] text-white p-12 md:w-5/12 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-secondary)]/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-3xl shadow-lg mb-6">
          W
        </div>
        <h1 className="text-3xl font-bold mb-4 leading-tight">
          Gestão Audiológica Inteligente.
        </h1>
        <p className="text-white/80 text-sm leading-relaxed">
          Acesse as normativas da empresa e converse com nosso Oráculo IA para tirar suas dúvidas rapidamente.
        </p>
      </div>

      <div className="relative z-10 mt-12 md:mt-0">
        <p className="text-xs font-semibold tracking-widest text-[var(--color-secondary)] uppercase">
          Tecnologia Humanizada
        </p>
      </div>
    </div>
  );
}

interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function LoginForm({
  email,
  password,
  rememberMe,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="p-8 md:p-12 md:w-7/12 flex flex-col justify-center bg-[var(--color-bg-white)]">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-2">Bem-vindo(a) de volta</h2>
        <p className="text-[var(--color-text-muted)] text-sm">Insira suas credenciais corporativas para acessar.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <Input
          label="E-mail corporativo"
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="debora.rh@winaudio.com.br"
          icon={<Mail size={18} />}
        />

        <Input
          label="Senha"
          type="password"
          required
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="••••••••"
          icon={<Lock size={18} />}
        />

        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberMeChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded-lg border-2 border-gray-200 bg-gray-50 peer-checked:bg-[var(--color-primary)] peer-checked:border-[var(--color-primary)] transition-all duration-200 peer-focus:ring-2 peer-focus:ring-[var(--color-primary)]/30" />
            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-text-dark)] transition-colors">
            Manter-me conectado
          </span>
        </label>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          icon={!loading ? <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /> : undefined}
          className="mt-4 group"
        >
          {loading ? 'Autenticando...' : 'Acessar Oráculo'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--color-text-light)]">
          Problemas com o acesso? Procure o administrador do sistema.
        </p>
      </div>
    </div>
  );
}