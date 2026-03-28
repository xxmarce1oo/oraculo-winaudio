'use client';

import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-md hover:shadow-lg',
  secondary: 'bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] text-white shadow-md hover:shadow-lg',
  ghost: 'bg-transparent hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
  danger: 'bg-[var(--color-error)] hover:bg-red-600 text-white shadow-md',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-8 py-3.5 text-sm rounded-2xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        font-semibold flex items-center justify-center gap-2 transition-all
        disabled:opacity-70 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : icon}
      {children}
    </button>
  );
}
