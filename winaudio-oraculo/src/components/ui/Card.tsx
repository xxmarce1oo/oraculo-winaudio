'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-8',
  lg: 'p-12',
};

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--color-bg-white)] rounded-2xl shadow-sm border border-[var(--color-border-light)]
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
