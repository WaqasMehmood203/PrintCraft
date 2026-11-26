import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ title, action, children, className, padded = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn('card', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          {typeof title === 'string' ? <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2> : title}
          {action}
        </header>
      )}
      <div className={cn(padded && 'p-5')}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, icon, hint, accent = 'brand' }: { label: string; value: ReactNode; icon: ReactNode; hint?: ReactNode; accent?: 'brand' | 'cyan' | 'yellow' | 'green' | 'violet' }) {
  const accents = {
    brand: 'from-brand-500/15 to-brand-500/0 text-brand-600',
    cyan: 'from-cyan/20 to-cyan/0 text-sky-700',
    yellow: 'from-yellow/30 to-yellow/0 text-amber-700',
    green: 'from-emerald-400/20 to-emerald-400/0 text-emerald-700',
    violet: 'from-violet-400/20 to-violet-400/0 text-violet-700',
  };
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-xl', accents[accent])} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', accents[accent])}>{icon}</div>
      </div>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className, label = 'Search' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; label?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-900" aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function FilterSelect({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav className="flex flex-col items-center justify-between gap-3 border-t border-ink-100 px-5 py-3 text-sm text-ink-500 sm:flex-row" aria-label="Pagination">
      <p>
        Showing <span className="font-semibold text-ink-900">{from}</span>–<span className="font-semibold text-ink-900">{to}</span> of{' '}
        <span className="font-semibold text-ink-900">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="inline-flex h-9 items-center gap-1 rounded-lg px-3 font-medium hover:bg-ink-100 disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="px-2 tabular-nums" aria-current="page">
          {page} / {pages}
        </span>
        <button onClick={() => onPage(page + 1)} disabled={page >= pages} className="inline-flex h-9 items-center gap-1 rounded-lg px-3 font-medium hover:bg-ink-100 disabled:opacity-40" aria-label="Next page">
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('flex gap-1 overflow-x-auto rounded-xl bg-ink-100/70 p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn('flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition', value === t.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900')}
        >
          {t.label}
          {t.count !== undefined && <span className={cn('rounded-full px-1.5 text-xs', value === t.value ? 'bg-brand-500 text-white' : 'bg-ink-200 text-ink-600')}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Responsive table: real table on md+, stacked cards on small screens. */
export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, caption }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string | number; onRowClick?: (r: T) => void; caption: string }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-ink-100 text-xs uppercase tracking-wider text-ink-500">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn('px-5 py-3 font-semibold', c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn('text-ink-700 transition', onRowClick && 'cursor-pointer hover:bg-ink-50')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('whitespace-nowrap px-5 py-3.5 align-middle', c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-ink-100 md:hidden" aria-label={caption}>
        {rows.map((r) => (
          <li key={rowKey(r)}>
            <div
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(r)) : undefined}
              className={cn('grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 text-sm', onRowClick && 'active:bg-ink-50')}
            >
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((c) => (
                  <div key={c.key} className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{c.header}</p>
                    <div className="mt-0.5 truncate text-ink-800">{c.cell(r)}</div>
                  </div>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
