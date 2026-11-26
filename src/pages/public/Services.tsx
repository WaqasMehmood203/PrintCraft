import { Search, X } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CtaBand, PageHero, ServiceCard } from '@/components/site/Blocks';
import { EmptyState } from '@/components/ui/Feedback';
import { useSite } from '@/context/SiteContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { cn } from '@/lib/utils';

export function ServicesPage() {
  useDocumentTitle('Services');
  const { site } = useSite();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';

  const setParam = (k: string, v: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p);
        if (v) n.set(k, v);
        else n.delete(k);
        return n;
      },
      { replace: true },
    );

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return site.services.filter(
      (s) => (!category || s.categorySlug === category) && (!q || `${s.title} ${s.shortDesc} ${s.categoryName}`.toLowerCase().includes(q)),
    );
  }, [site.services, query, category]);

  return (
    <>
      <PageHero
        photo="press-rollers"
        eyebrow="Services"
        title="Printing services built for scale"
        body="Garment branding, commercial print, and custom packaging with transparent minimums and lead times."
      />
      <div className="sticky top-[74px] z-30 border-b border-ink-100 bg-paper/95 backdrop-blur">
        <div className="container-x flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" role="tablist" aria-label="Filter by category">
            {[{ slug: '', name: 'All' }, ...site.categories].map((c) => (
              <button
                key={c.slug}
                role="tab"
                aria-selected={category === c.slug}
                onClick={() => setParam('category', c.slug)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
                  category === c.slug ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:ring-ink-400',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search services"
              aria-label="Search services"
              className="h-11 w-full rounded-lg border border-ink-200 bg-white pl-10 pr-9 text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-400 focus:outline-none focus:ring-4 focus:ring-ink-900/5 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button onClick={() => setParam('q', '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-900" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="container-x py-14 sm:py-16">
        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s, i) => (
              <ServiceCard key={s.id} s={s} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No services match"
            body="Try another search term or category."
            action={
              <button onClick={() => setParams({})} className="text-sm font-semibold text-brand-700 hover:underline">
                Clear filters
              </button>
            }
          />
        )}
      </section>
      <CtaBand photo="swatches" title="Need help picking a print method?" body="Reach out via Contact Us or submit specs through the User Portal." />
    </>
  );
}
