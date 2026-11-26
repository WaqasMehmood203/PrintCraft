import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Service } from '@shared/types';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/visuals/ProductVisual';
import { PROCESS_STEPS } from '@/data/siteData';
import { cn } from '@/lib/utils';

export function Reveal({ children, delay = 0, className, y = 16 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={cn('flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]', dark ? 'text-white/70' : 'text-brand-700')}>
      <span className={cn('h-px w-8', dark ? 'bg-white/50' : 'bg-brand-600')} aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'left',
  dark,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={cn('mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between', align === 'center' && 'items-center text-center md:flex-col md:items-center')}>
      <Reveal className={cn('max-w-2xl', align === 'center' && 'mx-auto flex flex-col items-center')}>
        <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
        <h2 className={cn('display mt-3 text-[2.3rem] leading-[1.08] sm:text-5xl', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
        {body && <p className={cn('mt-3 text-base leading-relaxed sm:text-[17px]', dark ? 'text-white/70' : 'text-ink-500')}>{body}</p>}
      </Reveal>
      {action && <Reveal delay={0.08}>{action}</Reveal>}
    </div>
  );
}

/** Photographic header for inner pages. */
export function PageHero({
  eyebrow,
  title,
  body,
  photo,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: string;
  photo: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <div className="absolute inset-0 -z-10">
        <Photo name={photo} alt="" priority sizes="100vw" imgClassName="animate-kenburns" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/92 via-ink-950/70 to-ink-950/35" />
      </div>
      <div className="container-x pb-14 pt-36 sm:pb-18 sm:pt-44">
        <Reveal>
          <Eyebrow dark>{eyebrow}</Eyebrow>
          <h1 className="display mt-4 max-w-3xl text-[2.6rem] leading-[1.04] text-white sm:text-6xl">{title}</h1>
          {body && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{body}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function ServiceCard({ s, index = 0 }: { s: Service; index?: number }) {
  return (
    <Reveal delay={(index % 3) * 0.05} className="h-full">
      <Link
        to={`/services/${s.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-ink-100 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Photo
            name={s.visual}
            alt={s.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            imgClassName="transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-3.5 top-3.5 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-700 backdrop-blur">
            {s.categoryName}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold text-ink-900">{s.title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">{s.shortDesc}</p>

        </div>
      </Link>
    </Reveal>
  );
}

export function ProcessSteps() {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {PROCESS_STEPS.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.05}>
          <li className="rounded-xl bg-white p-5 shadow-card ring-1 ring-ink-100">
            <div className="mb-4 aspect-[16/10] overflow-hidden rounded-lg">
              <Photo name={s.photo} alt={s.title} sizes="(min-width: 1024px) 25vw, 50vw" />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-xs font-bold tabular-nums text-brand-700">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-base font-semibold text-ink-900">{s.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.body}</p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function CtaBand({ title, body, photo = 'press-hall' }: { title: string; body: string; photo?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <div className="absolute inset-0 -z-10">
        <Photo name={photo} alt="" sizes="100vw" />
        <div className="absolute inset-0 bg-ink-950/75" />
      </div>
      <div className="container-x py-20 text-center sm:py-24">
        <Reveal>
          <h2 className="display mx-auto max-w-3xl text-4xl leading-tight text-white sm:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 sm:text-lg">{body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink to="/contact" variant="glass" size="lg">
              Contact Us
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
