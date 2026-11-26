import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { SUBMISSION_STATUS_LABEL, type SubmissionStatus } from '@shared/constants';
import { cn } from '@/lib/utils';

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn('h-5 w-5 animate-spin', className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ dark }: { dark?: boolean }) {
  return (
    <div className={cn('flex min-h-[50vh] items-center justify-center', dark ? 'text-ink-300' : 'text-ink-500')}>
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink-100', className)} aria-hidden />;
}

export function EmptyState({ icon, title, body, action, dark }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className={cn('mb-4 flex h-13 w-13 items-center justify-center rounded-2xl', dark ? 'bg-white/5 text-ink-300' : 'bg-ink-50 text-ink-400')}>
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className={cn('text-base font-semibold', dark ? 'text-white' : 'text-ink-900')}>{title}</h3>
      {body && <p className={cn('mt-1 max-w-sm text-sm', dark ? 'text-ink-300' : 'text-ink-500')}>{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, dark }: { message: string; onRetry?: () => void; dark?: boolean }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className={cn('text-base font-semibold', dark ? 'text-white' : 'text-ink-900')}>Something went wrong</h3>
      <p className={cn('mt-1 max-w-sm text-sm', dark ? 'text-ink-300' : 'text-ink-500')}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className={cn('mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold', dark ? 'border-white/15 text-white hover:bg-white/10' : 'border-ink-200 hover:bg-ink-50')}>
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

const tones = {
  gray: 'bg-ink-100 text-ink-700 ring-ink-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};
export type BadgeTone = keyof typeof tones;

export function Badge({ tone = 'gray', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}>{children}</span>;
}

export const STATUS_TONE: Record<SubmissionStatus, BadgeTone> = {
  pending: 'amber',
  approved: 'blue',
  in_production: 'violet',
  completed: 'green',
  rejected: 'red',
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {SUBMISSION_STATUS_LABEL[status]}
    </Badge>
  );
}
