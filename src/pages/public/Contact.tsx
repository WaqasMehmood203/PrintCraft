import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PageHero, Reveal } from '@/components/site/Blocks';
import { useSite } from '@/context/SiteContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { whatsappLink } from '@/lib/utils';

export function ContactPage() {
  useDocumentTitle('Contact Us');
  const { site } = useSite();
  const c = site.content;

  const channels = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      description: 'Chat with our team directly on WhatsApp',
      value: c.whatsapp,
      href: whatsappLink(c.whatsapp),
      ext: true,
      accent: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    },
    {
      icon: Phone,
      label: 'Phone',
      description: 'Call our sales & production desk',
      value: c.phone,
      href: `tel:${c.phone.replace(/\s/g, '')}`,
      ext: false,
      accent: 'bg-sky-50 text-sky-600 group-hover:bg-sky-100',
    },
    {
      icon: Mail,
      label: 'Email',
      description: 'Send us an email anytime',
      value: c.email,
      href: `mailto:${c.email}`,
      ext: false,
      accent: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    },
  ];

  return (
    <>
      <PageHero
        photo="conveyor"
        eyebrow="Contact Us"
        title="Get in touch directly"
        body="Reach us on WhatsApp, phone, or email to discuss your printing requirements."
      />
      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map((ch, i) => (
            <Reveal key={ch.label} delay={i * 0.05}>
              <a
                href={ch.href}
                target={ch.ext ? '_blank' : undefined}
                rel={ch.ext ? 'noopener noreferrer' : undefined}
                className="group flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition ${ch.accent}`}>
                      <ch.icon className="h-5 w-5" />
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-ink-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-700" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-ink-900">{ch.label}</h2>
                  <p className="mt-1 text-sm text-ink-500">{ch.description}</p>
                </div>
                <p className="mt-5 break-words border-t border-ink-100 pt-4 text-base font-semibold text-ink-900 group-hover:text-brand-700">
                  {ch.value}
                </p>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-8">
          <div className="grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-ink-100 sm:grid-cols-2 sm:p-8">
            <div className="flex gap-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Factory Address</p>
                <p className="mt-1 font-medium text-ink-900">{c.address}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Business Hours</p>
                <p className="mt-1 font-medium text-ink-900">{c.hours}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
