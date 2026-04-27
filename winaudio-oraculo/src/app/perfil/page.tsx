'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Save, KeyRound, User } from 'lucide-react';
import { EmployeeLayout, PageHeader } from '@/components/layout';
import { AuthGuard } from '@/components/auth';
import { Input, Button, Toast } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function PerfilPage() {
  return (
    <AuthGuard>
      <PerfilContent />
    </AuthGuard>
  );
}

function PerfilContent() {
  const { profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [salvandoNome, setSalvandoNome] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string; variant: 'success' | 'error' }>({ open: false, message: '', variant: 'success' });

  const showToast = (message: string, variant: 'success' | 'error') =>
    setToast({ open: true, message, variant });

  useEffect(() => {
    if (!profile) return;
    setNome(profile.full_name ?? '');

    // Busca avatar_url atual
    const supabase = createSupabaseBrowserClient();
    supabase.from('profiles').select('avatar_url').eq('id', profile.id).single()
      .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 2MB.', 'error');
      return;
    }

    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split('.').pop();
    const path = `${profile.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      showToast('Erro ao fazer upload da foto.', 'error');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
    setAvatarUrl(publicUrl);
    setUploading(false);
    showToast('Foto atualizada!', 'success');
  };

  const handleSalvarNome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !nome.trim()) return;
    setSalvandoNome(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from('profiles').update({ full_name: nome.trim() }).eq('id', profile.id);
    setSalvandoNome(false);
    if (error) showToast('Erro ao salvar nome.', 'error');
    else showToast('Nome atualizado!', 'success');
  };

  const handleSalvarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      showToast('As senhas não coincidem.', 'error');
      return;
    }
    if (novaSenha.length < 6) {
      showToast('A nova senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }
    setSalvandoSenha(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSalvandoSenha(false);
    if (error) showToast('Erro ao atualizar senha. Verifique a senha atual.', 'error');
    else {
      showToast('Senha atualizada com sucesso!', 'success');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    }
  };

  const iniciais = nome.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <EmployeeLayout>
      <PageHeader title="Meu Perfil" description="Gerencie suas informações pessoais e senha" />

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-xl space-y-6">

          {/* Avatar + Nome */}
          <div className="bg-white rounded-2xl border border-[var(--color-border-light)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
              <User size={16} className="text-[var(--color-primary)]" /> Informações pessoais
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 border-2 border-[var(--color-border-light)] flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={nome} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[var(--color-primary)]">{iniciais}</span>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-[var(--color-primary)] text-white rounded-lg flex items-center justify-center shadow-md hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="font-semibold text-[var(--color-primary-dark)]">{nome || 'Colaborador'}</p>
                <p className="text-xs text-[var(--color-text-light)] mt-0.5">
                  {uploading ? 'Enviando foto...' : 'Clique no ícone para alterar a foto'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSalvarNome} className="space-y-4">
              <Input
                label="Nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" size="md" loading={salvandoNome} icon={<Save size={15} />}>
                  Salvar nome
                </Button>
              </div>
            </form>
          </div>

          {/* Senha */}
          <div className="bg-white rounded-2xl border border-[var(--color-border-light)] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5 flex items-center gap-2">
              <KeyRound size={16} className="text-[var(--color-primary)]" /> Alterar senha
            </h2>
            <form onSubmit={handleSalvarSenha} className="space-y-4">
              <Input
                label="Nova senha"
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
                required
              />
              <div className="flex justify-end">
                <Button type="submit" size="md" loading={salvandoSenha} icon={<KeyRound size={15} />}>
                  Atualizar senha
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <Toast open={toast.open} message={toast.message} variant={toast.variant} onClose={() => setToast(t => ({ ...t, open: false }))} />
    </EmployeeLayout>
  );
}
