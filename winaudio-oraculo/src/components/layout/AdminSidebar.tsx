'use client';

import { FileText, LogOut, Users, Building, BookOpen } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { authService } from '@/services';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Normas', href: '/normas', icon: <BookOpen size={20} /> },
  { label: 'Gestão de Normas', href: '/admin/rules', icon: <FileText size={20} /> },
  { label: 'Gestão de Usuários', href: '/admin/users', icon: <Users size={20} /> },
  { label: 'Gestão de Setores', href: '/admin/departments', icon: <Building size={20} /> },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authService.logout();
    router.refresh();
    router.push('/login');
  };

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside className="w-64 bg-[var(--color-primary-dark)] text-white flex flex-col shadow-xl hidden md:flex">
      <div className="p-6 border-b border-white/10">
        <Logo variant="light" subtitle="Painel Gestor" />
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.href}
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
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
}
