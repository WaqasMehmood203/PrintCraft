import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Eyebrow, PageHero, Reveal, ServiceCard } from '@/components/site/Blocks';
import { ButtonLink } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { formatNumber, whatsappLink } from '@/lib/utils';
import { NotFoundPage } from './NotFound';

export function ServiceDetailPage() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const { site } = useSite();
  const service = site.services.find((s) => s.slug === slug);
  useDocumentTitle(service?.title ?? 'Service');

  const related = useMemo(() => site.services.filter((s) => s.id !== service?.id).slice(0, 3), [site.services, service]);

  if (!service) return <NotFoundPage />;

  const next = `/dashboard/new-order?service=${service.id}`;
  const orderTo = user?.role === 'user' ? next : `/contact`;

  return (
    <>
      <PageHero photo={service.visual} eyebrow={service.categoryName} title={service.title} body={service.shortDesc}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to={orderTo} size="lg" variant="light" iconRight={<ArrowRight className="h-5 w-5" />}>
            Submit Print Request
          </ButtonLink>
          <a
            href={whatsappLink(site.content.whatsapp, `Hello PrintCraft, I'm interested in ${service.title}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-7 py-3.5 font-semibold text-white hover:bg-white/10"
          >
            <MessageCircle className="h-5 w-5" /> WhatsApp
          </a>
        </div>
      </PageHero>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow>Overview</Eyebrow>
            <p className="mt-4 text-lg leading-relaxed text-ink-700">{service.fullDesc}</p>
          </Reveal>
          <Reveal className="mt-10">
            <h2 className="text-base font-semibold text-ink-900">Best suited for</h2>
            <ul className="mt-3 space-y-2.5">
              {service.applications.map((x) => (
                <li key={x} className="flex gap-3 text-[15px] text-ink-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {x}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="mt-10">
            <h2 className="text-base font-semibold text-ink-900">Specifications</h2>
            <dl className="mt-3 divide-y divide-ink-100 overflow-hidden rounded-xl bg-white ring-1 ring-ink-100">
              {[{ label: 'Lead time', value: service.leadTime }, ...service.specs].map((sp) => (
                <div key={sp.label} className="grid grid-cols-5 gap-4 px-5 py-3.5 text-sm">
                  <dt className="col-span-2 text-ink-500">{sp.label}</dt>
                  <dd className="col-span-3 font-medium text-ink-900">{sp.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <aside className="lg:col-span-5">
          <div className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-ink-100 lg:sticky lg:top-24">
            <div className="border-b border-ink-100 px-6 py-4">
              <h3 className="font-semibold text-ink-900">Order Details</h3>
              <p className="text-xs text-ink-500">{service.categoryName}</p>
            </div>
            <dl className="divide-y divide-ink-100 px-6 text-sm">
              <div className="flex justify-between py-3.5">
                <dt className="text-ink-500">Minimum order</dt>
                <dd className="font-semibold text-ink-900">{formatNumber(service.minQty)} {service.unit}s</dd>
              </div>
              <div className="flex justify-between py-3.5">
                <dt className="text-ink-500">Lead time</dt>
                <dd className="font-semibold text-ink-900">{service.leadTime}</dd>
              </div>
            </dl>
            <div className="border-t border-ink-100 bg-paper/60 px-6 py-5 space-y-3">
              <ButtonLink to={orderTo} className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
                Start Print Request
              </ButtonLink>
              <a
                href={whatsappLink(site.content.whatsapp, `Hello PrintCraft, I'm interested in ${service.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-ink-50"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink-100 bg-white py-16">
          <div className="container-x">
            <h2 className="display mb-8 text-3xl text-ink-900 sm:text-4xl">Other printing services</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <ServiceCard key={r.id} s={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
