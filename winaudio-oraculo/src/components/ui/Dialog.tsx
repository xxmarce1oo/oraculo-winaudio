'use client';

import { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from './Button';

type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface DialogProps {
  open: boolean;
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig: Record<DialogVariant, { icon: React.ElementType; iconClass: string; bgClass: string }> = {
  danger:  { icon: XCircle,        iconClass: 'text-red-500',    bgClass: 'bg-red-50' },
  warning: { icon: AlertTriangle,  iconClass: 'text-amber-500',  bgClass: 'bg-amber-50' },
  info:    { icon: Info,           iconClass: 'text-blue-500',   bgClass: 'bg-blue-50' },
  success: { icon: CheckCircle,    iconClass: 'text-emerald-500',bgClass: 'bg-emerald-50' },
};

export function Dialog({
  open,
  title,
  message,
  variant = 'info',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const { icon: Icon, iconClass, bgClass } = variantConfig[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[var(--color-bg-white)] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-[var(--color-text-light)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center mb-4`}>
          <Icon size={24} className={iconClass} />
        </div>

        <h2 className="text-lg font-bold text-[var(--color-primary-dark)] mb-1">{title}</h2>
        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{message}</p>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {cancelLabel}
          </button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'secondary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
