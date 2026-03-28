'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({ message, size = 32 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] gap-3">
      <Loader2 className="animate-spin text-[var(--color-primary)]" size={size} />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
}
