'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface EmployeeLayoutProps {
  children: ReactNode;
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] font-sans flex">
      <Sidebar variant="employee" />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
