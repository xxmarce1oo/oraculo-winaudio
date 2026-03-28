'use client';

import { BookOpen, MessageCircle, LogOut, User, FileText, Users, Building } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { authService } from '@/services';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const baseNavItems: NavItem[] = [
  { label: 'Normas', href: '/normas', icon: <BookOpen size={20} /> },
  { label: 'Oráculo IA', href: '/normas/chat', icon: <MessageCircle size={20} /> },
];

const adminNavItems: NavItem[] = [
  { label: 'Gestão de Normas', href: '/admin/rules', icon: <FileText size={20} />, adminOnly: true },
  { label: 'Gestão de Usuários', href: '/admin/users', icon: <Users size={20} />, adminOnly: true },
  { label: 'Gestão de Setores', href: '/admin/departments', icon: <Building size={20} />, adminOnly: true },
];

interface SidebarProps {
  variant?: 'admin' | 'employee';
}

export function Sidebar({ variant = 'employee' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoading } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    router.refresh();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/normas') {
      return pathname === '/normas';
    }
    return pathname?.startsWith(href);
  };

  const isAdmin = profile?.role === 'admin_global' || profile?.role === 'gestor_setor';
  const allItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  const subtitle = isAdmin ? 'Painel Gestor' : 'Portal do Colaborador';

  if (isLoading) {
    return (
      <aside className="w-64 bg-[var(--color-primary-dark)] text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <Logo variant="light" subtitle={subtitle} />
        </div>
        <div className="flex-1 px-4 mt-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[var(--color-primary-dark)] text-white flex flex-col shadow-xl hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <Logo variant="light" subtitle={subtitle} />
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {allItems.map((item, index) => (
          <div key={item.href}>
            {item.adminOnly && index === baseNavItems.length && (
              <div className="text-xs text-gray-500 uppercase tracking-wider px-4 py-2 mt-4 mb-2 border-t border-white/10 pt-4">
                Administração
              </div>
            )}
            <button
              onClick={() => router.push(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2 text-gray-300">
          <User size={18} />
          <span className="text-sm truncate">{profile?.full_name || 'Usuário'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
