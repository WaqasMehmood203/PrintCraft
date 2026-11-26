import { Mail, MapPin, Phone, ShieldCheck, Target, Telescope, User2 } from 'lucide-react';
import { CtaBand, PageHero, Reveal, SectionHeading } from '@/components/site/Blocks';
import { Photo } from '@/components/visuals/ProductVisual';
import { useSite } from '@/context/SiteContext';
import { useDocumentTitle } from '@/hooks/useAsync';

const FACILITY = [
  { photo: 'press-hall', caption: 'Press hall' },
  { photo: 'garment-factory', caption: 'Garment finishing' },
  { photo: 'swatches', caption: 'Colour matching' },
  { photo: 'warehouse', caption: 'Export dispatch' },
];

export function AboutPage() {
  useDocumentTitle('About');
  const { site } = useSite();
  const c = site.content;

  return (
    <>
      <PageHero
        photo="press-operators"
        eyebrow="About us"
        title="We print brands for brands"
        body="Garment branding, commercial print, and packaging from Faisalabad, Pakistan to exporters and apparel labels worldwide."
      />

      <section className="container-x py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Our story" title="Craft & precision under one roof" />
            <Reveal>
              <p className="-mt-4 text-[17px] leading-relaxed text-ink-600">{c.aboutIntro}</p>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Target, title: 'Mission', body: c.mission },
                { icon: Telescope, title: 'Vision', body: c.vision },
                { icon: ShieldCheck, title: 'Quality', body: 'Every batch is wash, stretch, and Pantone checked before shipping.' },
              ].map((b) => (
                <Reveal key={b.title} className="rounded-xl bg-white p-5 shadow-card ring-1 ring-ink-100">
                  <b.icon className="h-5 w-5 text-brand-600" />
                  <h3 className="mt-3 font-semibold text-ink-900">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{b.body}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="lg:col-span-5" delay={0.08}>
            <div className="rounded-xl bg-white p-7 shadow-card ring-1 ring-ink-100">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Company details</h3>
              <dl className="mt-5 space-y-4 text-[15px]">
                <div className="flex gap-3.5">
                  <User2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <dt className="text-xs text-ink-500">Chief Executive Officer</dt>
                    <dd className="font-semibold text-ink-900">Rana Faiz Rasool</dd>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <dt className="text-xs text-ink-500">Factory &amp; Office</dt>
                    <dd className="font-semibold text-ink-900">{c.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <dt className="text-xs text-ink-500">Telephone</dt>
                    <dd className="font-semibold text-ink-900">{c.phone}</dd>
                  </div>
                </div>
                <div className="flex gap-3.5">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <div>
                    <dt className="text-xs text-ink-500">Email</dt>
                    <dd className="break-all font-semibold text-ink-900">{c.email}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Facility" title="Inside our factory" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FACILITY.map((f, i) => (
              <Reveal key={f.photo} delay={i * 0.05}>
                <figure>
                  <div className="aspect-[4/3] overflow-hidden rounded-xl">
                    <Photo name={f.photo} alt={f.caption} sizes="(min-width: 1024px) 25vw, 50vw" />
                  </div>
                  <figcaption className="mt-2.5 text-sm font-medium text-ink-700">{f.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand photo="conveyor" title={c.ctaTitle} body={c.ctaSubtitle} />
    </>
  );
}
