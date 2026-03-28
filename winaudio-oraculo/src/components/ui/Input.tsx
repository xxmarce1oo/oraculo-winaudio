'use client';

import { InputHTMLAttributes, ReactNode, ChangeEvent } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({
  label,
  icon,
  error,
  className = '',
  onChange,
  ...props
}: InputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-semibold text-[var(--color-text-secondary)] block ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          onChange={handleChange}
          className={`
            w-full py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-2xl 
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] 
            transition-all text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)]
            ${icon ? 'pl-11 pr-4' : 'px-4'}
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/50 focus:border-[var(--color-error)]' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <span className="absolute left-4 top-3.5 text-gray-400">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}
