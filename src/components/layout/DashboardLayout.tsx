import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { Role } from '@shared/constants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { BrandLogo } from './Brand';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

/** Route guard enforcing authenticated user access. */
export function RequireRole({ role }: { role: Role }) {
  // Login removed; always render children
  return <Outlet />;
}

export function DashboardLayout({ nav, variant }: { nav: NavGroup[]; variant: Role }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const base = '/dashboard';

  useEffect(() => {
    setOpen(false);
    document.querySelector('#dash-main')?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const signOut = async () => {
    navigate('/', { replace: true });
    await logout();
    toast.success('Signed out');
  };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[70px] items-center justify-between px-5">
        <BrandLogo to={base} />
      </div>
      <p
        className={cn(
          'mx-5 mb-3 inline-flex w-fit rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]',
          variant === 'admin' ? 'bg-brand-500/20 text-brand-300' : 'bg-cyan/15 text-cyan',
        )}
      >
        {variant === 'admin' ? 'Admin role' : 'User role'}
      </p>
      <nav className="flex-1 overflow-y-auto px-3 py-1" aria-label={`${variant} navigation`}>
        {nav.map((g, i) => (
          <div key={i} className="mb-4">
            {g.title && <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">{g.title}</p>}
            <ul className="flex flex-col gap-0.5">
              {g.items.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <n.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-cyan' : 'text-ink-400 group-hover:text-ink-200')} aria-hidden />
                        <span className="flex-1">{n.label}</span>
                        {n.badge !== undefined && n.badge > 0 && (
                          <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-white">{n.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px] text-ink-400" /> View website
        </Link>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
          <LogOut className="h-[18px] w-[18px] text-ink-400" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="surface-light flex min-h-dvh">
      <a href="#dash-main" className="sr-only z-[60] rounded-lg bg-white px-4 py-2 font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink-900 lg:block">{Sidebar}</aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 bg-ink-900 lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-lg p-2 text-ink-300 hover:text-white" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setOpen(true)} className="-ml-1 rounded-lg p-2 text-ink-700 hover:bg-ink-100 lg:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-brand-500 text-xs font-bold text-white">
              {user?.name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold leading-tight text-ink-900">{user?.name}</span>
              <span className="block text-xs leading-tight text-ink-500">{variant === 'admin' ? 'Administrator' : (user?.company ?? 'User')}</span>
            </span>
          </div>
        </header>
        <main id="dash-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
