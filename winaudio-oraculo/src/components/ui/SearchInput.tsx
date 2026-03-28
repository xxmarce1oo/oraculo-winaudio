'use client';

import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ className = '', onChange, onSearch, ...props }: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onSearch?.(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:bg-[var(--color-bg-white)] transition-all text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)]"
        {...props}
      />
      <Search className="absolute left-3.5 top-3 text-[var(--color-text-light)]" size={18} />
    </div>
  );
}
