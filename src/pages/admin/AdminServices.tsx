import { useState } from 'react';
import type { Service } from '@shared/types';
import { PageHeader } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Data';
import { Badge } from '@/components/ui/Feedback';
import { Toggle } from '@/components/ui/Form';
import { useSite } from '@/context/SiteContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { getServices, toggleServiceActive } from '@/lib/staticStore';
import { formatMoney, formatNumber } from '@/lib/utils';

export function AdminServices() {
  useDocumentTitle('Admin Services');
  const { reload } = useSite();
  const toast = useToast();
  const [services, setServices] = useState<Service[]>(() => getServices(true));

  const onToggle = (s: Service) => {
    const next = toggleServiceActive(s.id);
    setServices(next);
    reload();
    toast.success(`${s.title} ${s.active ? 'hidden' : 'activated'}`);
  };

  return (
    <>
      <PageHeader title="Printing Services" description="Concise 6-service catalogue shown on the public website." />
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-ink-900">{s.title}</h2>
                  <Badge tone={s.active ? 'green' : 'gray'}>{s.active ? 'Active' : 'Hidden'}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-500">{s.shortDesc}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {s.categoryName} · MOQ {formatNumber(s.minQty)} {s.unit}s · From {formatMoney(s.priceFrom)}
                </p>
              </div>
            </div>
            <div className="mt-3 border-t border-ink-100 pt-2">
              <Toggle checked={s.active} onChange={() => onToggle(s)} label="Visible on website" />
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
