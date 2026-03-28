'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-[var(--color-bg-white)] rounded-2xl border border-[var(--color-border)] border-dashed p-12 text-center flex flex-col items-center justify-center h-64">
      <div className="w-16 h-16 bg-[var(--color-bg-muted)] rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--color-text-secondary)] mb-1">{title}</h3>
      <p className="text-[var(--color-text-muted)] text-sm mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}
