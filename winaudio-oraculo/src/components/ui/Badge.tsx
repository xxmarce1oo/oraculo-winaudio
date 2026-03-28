'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]',
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
};

export function Badge({ children, variant = 'primary', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
}
