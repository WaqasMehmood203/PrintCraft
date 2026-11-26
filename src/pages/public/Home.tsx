import { ArrowRight, Check, Globe2, Layers, Printer, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CtaBand, Eyebrow, ProcessSteps, Reveal, SectionHeading, ServiceCard } from '@/components/site/Blocks';
import { ButtonLink } from '@/components/ui/Button';
import { PrintPress3D } from '@/components/visuals/PrintPress3D';
import { useSite } from '@/context/SiteContext';
import { useDocumentTitle } from '@/hooks/useAsync';

function Hero() {
  const { site } = useSite();
  const c = site.content;

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 pb-20 pt-28 sm:pb-24 sm:pt-32">
      {/* Subtle CMYK ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-96 w-96 rounded-full bg-cyan/12 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 -z-10 h-96 w-96 rounded-full bg-brand-500/15 blur-[130px]" />

      <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow dark>{c.heroEyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="display mt-5 text-[clamp(2.6rem,5.2vw,4.5rem)] leading-[1.03] text-white">{c.heroTitle}</h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{c.heroSubtitle}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink to="/services" variant="glass" size="lg">
                Explore Services
              </ButtonLink>
              <ButtonLink to="/contact" variant="glass" size="lg">
                Get In Touch <span role="img" aria-label="wave">👋</span>
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              {['Pantone-matched colour', '3–5 day sampling', 'Export-ready packing'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Real 3D CMYK Printing Press Animation */}
        <Reveal delay={0.14} className="lg:col-span-6">
          <PrintPress3D className="h-[350px] sm:h-[400px] lg:h-[430px]" />
        </Reveal>
      </div>
    </section>
  );
}

function Highlights() {
  const { site } = useSite();
  const items = [
    { icon: Printer, value: String(site.services.length), label: 'Core Print Services', to: '/services' },
    { icon: Layers, value: 'CMYK + Pantone', label: 'Colour Standards', to: '/services' },
    { icon: ShieldCheck, value: '50+ Washes', label: 'Garment Durability', to: '/about' },
    { icon: Globe2, value: 'Worldwide', label: 'Export Shipping', to: '/contact' },
  ];
  return (
    <section className="relative z-10 -mt-9">
      <div className="container-x">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-ink-100 lg:grid-cols-4">
          {items.map((it, i) => (
            <Link
              key={it.label}
              to={it.to}
              className={`group flex items-center gap-3.5 p-4 transition hover:bg-paper sm:p-6 ${i % 2 === 1 ? 'border-l border-ink-100' : ''} ${i >= 2 ? 'border-t border-ink-100 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <it.icon className="hidden h-5 w-5 shrink-0 text-brand-600 sm:block" aria-hidden />
              <div>
                <p className="text-lg font-bold tracking-tight text-ink-900 sm:text-xl">{it.value}</p>
                <p className="text-xs text-ink-500 sm:text-sm">{it.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  useDocumentTitle('');
  const { site } = useSite();

  return (
    <>
      <Hero />
      <Highlights />

      <section className="container-x py-20 sm:py-24">
        <SectionHeading
          eyebrow="Services"
          title="What we print"
          body="Six core production lines with clear minimums and reliable lead times."
          action={
            <ButtonLink to="/services" variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
              All services
            </ButtonLink>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {site.services.slice(0, 6).map((s, i) => (
            <ServiceCard key={s.id} s={s} index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="Four steps from brief to delivery" />
          <ProcessSteps />
        </div>
      </section>

      <CtaBand title={site.content.ctaTitle} body={site.content.ctaSubtitle} />
    </>
  );
}
