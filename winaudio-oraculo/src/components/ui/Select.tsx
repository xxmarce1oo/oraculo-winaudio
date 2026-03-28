'use client';

import { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-semibold text-[var(--color-text-secondary)] block ml-1">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-2xl 
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] 
          transition-all text-sm text-[var(--color-text-primary)]
          ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/50 focus:border-[var(--color-error)]' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-[var(--color-error)] ml-1">{error}</p>
      )}
    </div>
  );
}
