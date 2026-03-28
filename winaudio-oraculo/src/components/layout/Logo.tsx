'use client';

interface LogoProps {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  subtitle?: string;
}

export function Logo({ variant = 'light', showSubtitle = true, subtitle = 'Painel Gestor' }: LogoProps) {
  const isDark = variant === 'dark';
  
  return (
    <div className="flex items-center gap-3">
      <div 
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg
          ${isDark ? 'bg-[var(--color-primary-dark)] text-white' : 'bg-white text-[var(--color-primary-dark)]'}
        `}
      >
        W
      </div>
      <div>
        <span 
          className={`
            text-xl font-bold tracking-tight leading-none block
            ${isDark ? 'text-[var(--color-primary-dark)]' : 'text-white'}
          `}
        >
          WINAUDIO
        </span>
        {showSubtitle && (
          <span className="text-[10px] text-[var(--color-secondary)] font-semibold uppercase tracking-wider">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
