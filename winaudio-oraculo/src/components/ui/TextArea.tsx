'use client';

import { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({
  label,
  error,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-semibold text-[var(--color-text-secondary)] block ml-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-2xl 
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] 
          transition-all text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] resize-y
          ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/50 focus:border-[var(--color-error)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-error)] ml-1">{error}</p>
      )}
    </div>
  );
}
