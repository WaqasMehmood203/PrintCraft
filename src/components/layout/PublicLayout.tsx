import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Mail, MapPin, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSite } from '@/context/SiteContext';
import { cn, whatsappLink } from '@/lib/utils';
import { BrandLogo } from './Brand';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid ? 'border-b border-ink-100 bg-white/95 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-xl' : 'bg-gradient-to-b from-black/45 to-transparent',
      )}
    >
      <nav className="container-x flex h-[74px] items-center justify-between gap-6" aria-label="Main">
        <BrandLogo dark={!solid} />
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-md px-3.5 py-2 text-[14px] font-medium transition-colors',
                    solid ? (isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900') : isActive ? 'text-white' : 'text-white/75 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && <motion.span layoutId="nav-underline" className={cn('absolute inset-x-3.5 -bottom-[3px] h-[2px] rounded-full', solid ? 'bg-brand-600' : 'bg-white')} />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className={cn('-mr-2 rounded-md p-2 md:hidden', solid ? 'text-ink-900' : 'text-white')}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100dvh-74px)] overflow-y-auto bg-white md:hidden">
            <ul className="container-x flex flex-col py-2">
              {NAV.map((n, i) => (
                <motion.li key={n.to} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
                  <NavLink to={n.to} end={n.end} className={({ isActive }) => cn('flex items-center justify-between border-b border-ink-100 py-4 text-lg', isActive ? 'font-semibold text-ink-900' : 'text-ink-600')}>
                    {n.label}
                    <ArrowRight className="h-4 w-4 text-ink-300" />
                  </NavLink>
                </motion.li>
              ))}
            </ul>

          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Footer() {
  const { site } = useSite();
  const c = site.content;

  return (
    <footer className="bg-ink-950 text-sm text-white/70">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <BrandLogo />
          <p className="mt-4 max-w-sm leading-relaxed text-white/60">
            Garment branding, commercial printing, and custom packaging from our factory in Faisalabad, Pakistan.
          </p>
          <a
            href={whatsappLink(c.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 font-medium text-white hover:bg-white/5"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp {c.whatsapp}
          </a>
        </div>
        <div className="lg:col-span-3">
          <FooterCol title="Pages">
            <ul className="space-y-2.5">
              {[
                ['/', 'Home'],
                ['/services', 'Services'],
                ['/about', 'About'],
                ['/contact', 'Contact Us'],

              ].map(([to, l]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterCol>
        </div>
        <div className="lg:col-span-4">
          <FooterCol title="Factory & Sales">
            <ul className="space-y-3">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" /> <a href={`https://www.google.com/maps/search/${encodeURIComponent(c.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">{c.address}</a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="hover:text-white">
                  {c.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <a href={`mailto:${c.email}`} target="_blank" rel="noopener noreferrer" className="break-all hover:text-white">
                  {c.email}
                </a>
              </li>
              <li className="pl-7 text-xs text-white/50">{c.hours}</li>
            </ul>
          </FooterCol>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} PrintCraft International. All rights reserved.</p>
          <p>Developed by <a href="https://wa.me/923461753318" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Waqas Mehmood</a> · <a href="tel:03461753318" className="underline hover:text-white">03461753318</a></p>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <a href="#main" className="sr-only z-[60] rounded-lg bg-white px-4 py-2 font-semibold text-ink-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
