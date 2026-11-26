import { CheckCircle2, Paperclip, Send } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fieldErrors, printRequestSchema } from '@shared/schemas';
import { PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Data';
import { FormError, Input, Select, Textarea } from '@/components/ui/Form';
import { Photo } from '@/components/visuals/ProductVisual';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { StoreError, submitPrintRequest } from '@/lib/staticStore';
import { formatNumber } from '@/lib/utils';

export function NewRequestPage() {
  useDocumentTitle('Submit Print Request');
  const { site } = useSite();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const defaultServiceId = params.get('service') ?? String(site.services[0]?.id ?? '');
  const [form, setForm] = useState({
    serviceId: defaultServiceId,
    subject: '',
    quantity: '',
    size: '',
    colors: '',
    material: '',
    deadline: '',
    country: user?.country ?? 'Pakistan',
    notes: '',
    artworkName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const service = useMemo(() => site.services.find((s) => String(s.id) === form.serviceId), [site.services, form.serviceId]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    const parsed = printRequestSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    try {
      const saved = submitPrintRequest(user, parsed.data);
      toast.success(`Request ${saved.ref} submitted`, 'Now visible in your dashboard.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const s = err as StoreError;
      setErrors(s.fields ?? {});
      setFormError(s.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Submit print request"
        description="Fill in your specifications to submit a new print request."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Print specifications">
          <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
            <FormError message={formError} />
            <Select
              label="Printing service"
              required
              wrapperClassName="sm:col-span-2"
              value={form.serviceId}
              onChange={set('serviceId')}
              error={errors.serviceId}
              options={site.services.map((s) => ({
                value: s.id,
                label: `${s.title} (MOQ ${formatNumber(s.minQty)} ${s.unit}s)`,
              }))}
            />
            <Input
              label="Project title"
              required
              wrapperClassName="sm:col-span-2"
              placeholder="e.g. Summer tee neck labels"
              value={form.subject}
              onChange={set('subject')}
              error={errors.subject}
            />
            <Input
              label={`Quantity${service ? ` (${service.unit}s)` : ''}`}
              required
              type="number"
              min={service?.minQty ?? 1}
              value={form.quantity}
              onChange={set('quantity')}
              error={errors.quantity}
              hint={service ? `Minimum ${formatNumber(service.minQty)} ${service.unit}s` : undefined}
            />
            <Input label="Print / label size" placeholder="e.g. 5 × 4 cm" value={form.size} onChange={set('size')} error={errors.size} />
            <Input label="Colours" placeholder="e.g. 2 Pantone or CMYK" value={form.colors} onChange={set('colors')} error={errors.colors} />
            <Input label="Material / fabric" placeholder="e.g. Combed cotton, 350 gsm board" value={form.material} onChange={set('material')} error={errors.material} />
            <Input label="Needed by" type="date" min={new Date().toISOString().slice(0, 10)} value={form.deadline} onChange={set('deadline')} error={errors.deadline} />
            <Input label="Ship to country" value={form.country} onChange={set('country')} error={errors.country} />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Artwork file (optional)</label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-300 bg-ink-50/50 px-4 py-3 text-sm text-ink-600 hover:border-brand-500">
                <Paperclip className="h-4 w-4 text-ink-400" />
                <span className="truncate">{form.artworkName || 'Select artwork file (.pdf, .ai, .png, .svg)'}</span>
                <input
                  type="file"
                  accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setForm((prev) => ({ ...prev, artworkName: f.name }));
                  }}
                />
              </label>
            </div>

            <Textarea
              label="Notes & finishing details"
              required
              rows={4}
              wrapperClassName="sm:col-span-2"
              placeholder="Placement, Pantone codes, packaging or wash requirements…"
              value={form.notes}
              onChange={set('notes')}
              error={errors.notes}
            />
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" icon={<Send className="h-4 w-4" />}>
                Submit Print Request
              </Button>
            </div>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card padded={false}>
            {service && (
              <>
                <div className="aspect-[16/10] overflow-hidden rounded-t-2xl">
                  <Photo name={service.visual} alt={service.title} />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{service.categoryName}</p>
                  <h2 className="mt-1 font-semibold text-ink-900">{service.title}</h2>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Minimum order</dt>
                      <dd className="font-medium">{formatNumber(service.minQty)} {service.unit}s</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink-500">Lead time</dt>
                      <dd className="font-medium">{service.leadTime}</dd>
                    </div>
                  </dl>
                </div>
              </>
            )}
          </Card>
          <div className="flex items-start gap-2.5 rounded-2xl border border-ink-100 bg-white p-4 text-xs text-ink-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>Your print request is saved directly to your portal dashboard.</span>
          </div>
        </aside>
      </div>
    </>
  );
}
