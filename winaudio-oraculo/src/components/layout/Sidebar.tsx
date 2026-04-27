'use client';

import { BookOpen, MessageCircle, LogOut, User, FileText, Users, Building, CalendarDays, Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { authService, avisosService } from '@/services';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: number;
}

export function Sidebar({ variant = 'employee' }: { variant?: 'admin' | 'employee' }) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isLoading } = useAuth();
  const [unreadAvisos, setUnreadAvisos] = useState(0);

  useEffect(() => {
    if (!profile) return;
    avisosService.countUnread().then(setUnreadAvisos);
  }, [profile, pathname]); // recontagem ao navegar

  const handleLogout = async () => {
    await authService.logout();
    router.refresh();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/normas') return pathname === '/normas';
    return pathname?.startsWith(href);
  };

  const isAdmin = profile?.role === 'admin_global' || profile?.role === 'gestor_setor';
  const subtitle = isAdmin ? 'Painel Gestor' : 'Portal do Colaborador';

  const baseNavItems: NavItem[] = [
    { label: 'Normas', href: '/normas', icon: <BookOpen size={20} /> },
    { label: 'Oráculo IA', href: '/normas/chat', icon: <MessageCircle size={20} /> },
    { label: 'Salas', href: '/salas', icon: <CalendarDays size={20} /> },
    { label: 'Avisos', href: '/avisos', icon: <Bell size={20} />, badge: unreadAvisos },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Gestão de Normas', href: '/admin/rules', icon: <FileText size={20} />, adminOnly: true },
    { label: 'Gestão de Salas', href: '/admin/salas', icon: <CalendarDays size={20} />, adminOnly: true },
    { label: 'Gestão de Usuários', href: '/admin/users', icon: <Users size={20} />, adminOnly: true },
    { label: 'Gestão de Setores', href: '/admin/departments', icon: <Building size={20} />, adminOnly: true },
    { label: 'Mural de Avisos', href: '/admin/avisos', icon: <Bell size={20} />, adminOnly: true },
  ];

  const allItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

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
              <span className="relative flex-shrink-0">
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
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
