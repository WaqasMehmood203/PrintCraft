import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="24" cy="27" r="13" fill="#12b5e5" opacity=".92" />
      <circle cx="40" cy="27" r="13" fill="#e4237e" opacity=".85" style={{ mixBlendMode: 'multiply' }} />
      <circle cx="32" cy="41" r="13" fill="#ffc629" opacity=".85" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}

export function BrandLogo({ dark = true, className, to = '/' }: { dark?: boolean; className?: string; to?: string }) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2.5', className)} aria-label="PrintCraft International home">
      <span className={cn('inline-flex shrink-0 items-center justify-center rounded-lg', dark && 'bg-white/90 p-1')}>
        <Mark className="h-8 w-8" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('text-[17px] font-bold tracking-tight transition-colors', dark ? 'text-white' : 'text-ink-900')}>PrintCraft</span>
        <span className={cn('mt-0.5 text-[9px] font-semibold uppercase tracking-[0.3em] transition-colors', dark ? 'text-white/60' : 'text-ink-500')}>International</span>
      </span>
    </Link>
  );
}
