import { ArrowLeft } from 'lucide-react';
import { PageHero } from '@/components/site/Blocks';
import { ButtonLink } from '@/components/ui/Button';
import { useDocumentTitle } from '@/hooks/useAsync';

export function NotFoundPage({ dashboard }: { dashboard?: boolean }) {
  useDocumentTitle('Page not found');
  if (dashboard) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <p className="text-6xl font-bold text-ink-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-ink-900">This page doesn’t exist</h1>
        <p className="mt-2 text-sm text-ink-500">It may have been moved or the link is incorrect.</p>
        <ButtonLink to=".." relative="path" className="mt-6" variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
          Go back
        </ButtonLink>
      </div>
    );
  }
  return (
    <PageHero photo="paper-stock" eyebrow="404" title="This page isn’t on our presses" body="It may have moved, or the link may be wrong.">
      <div className="mt-8 flex gap-3">
        <ButtonLink to="/" variant="light">
          Back to home
        </ButtonLink>
        <ButtonLink to="/services" variant="glass">
          Browse services
        </ButtonLink>
      </div>
    </PageHero>
  );
}
