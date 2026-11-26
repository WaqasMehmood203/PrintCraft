import { CheckCircle2, Clock, FilePlus2, Hourglass, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SUBMISSION_KIND_LABEL } from '@shared/constants';
import type { Submission } from '@shared/types';
import { PageHeader } from '@/components/layout/DashboardLayout';
import { ButtonLink } from '@/components/ui/Button';
import { Card, DataTable, StatCard } from '@/components/ui/Data';
import { Badge, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { listUserSubmissions, subscribeStore } from '@/lib/staticStore';
import { formatDate, formatNumber } from '@/lib/utils';

export function UserDashboard() {
  useDocumentTitle('User Dashboard');
  const { user } = useAuth();
  const [items, setItems] = useState<Submission[]>(() => (user ? listUserSubmissions(user) : []));
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    if (!user) return;
    const refresh = () => setItems(listUserSubmissions(user));
    refresh();
    return subscribeStore(refresh);
  }, [user]);

  const pending = items.filter((s) => s.status === 'pending').length;
  const active = items.filter((s) => s.status === 'approved' || s.status === 'in_production').length;
  const completed = items.filter((s) => s.status === 'completed').length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name.split(' ')[0] ?? 'User'}`}
        description="Submit a print request and track your submission status."
        actions={
          <ButtonLink to="/dashboard/new-order" icon={<FilePlus2 className="h-4 w-4" />}>
            Submit Print Request
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total submissions" value={formatNumber(items.length)} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Pending review" value={formatNumber(pending)} icon={<Hourglass className="h-5 w-5" />} accent="yellow" />
        <StatCard label="In progress" value={formatNumber(active)} icon={<Clock className="h-5 w-5" />} accent="violet" />
        <StatCard label="Completed" value={formatNumber(completed)} icon={<CheckCircle2 className="h-5 w-5" />} accent="green" />
      </div>

      <Card
        className="mt-6"
        padded={false}
        title="My submitted forms"
        action={
          <ButtonLink to="/dashboard/new-order" variant="outline" size="sm">
            New form
          </ButtonLink>
        }
      >
        {items.length ? (
          <DataTable
            caption="My submitted forms"
            rows={items}
            rowKey={(s) => s.id}
            onRowClick={setSelected}
            columns={[
              { key: 'ref', header: 'Ref', cell: (s) => <span className="font-semibold text-ink-900">{s.ref}</span> },
              {
                key: 'kind',
                header: 'Type',
                cell: (s) => <Badge tone={s.kind === 'print_request' ? 'blue' : 'gray'}>{SUBMISSION_KIND_LABEL[s.kind]}</Badge>,
              },
              {
                key: 'subject',
                header: 'Project / Subject',
                cell: (s) => (
                  <span>
                    <span className="block max-w-[240px] truncate font-medium text-ink-900">{s.subject}</span>
                    {s.serviceTitle && <span className="text-xs text-ink-500">{s.serviceTitle}</span>}
                  </span>
                ),
              },
              { key: 'qty', header: 'Qty', cell: (s) => (s.quantity ? formatNumber(s.quantity) : '—'), hideOnMobile: true },
              { key: 'status', header: 'Status', cell: (s) => <StatusBadge status={s.status} /> },
              { key: 'date', header: 'Submitted', cell: (s) => formatDate(s.createdAt), hideOnMobile: true },
            ]}
          />
        ) : (
          <EmptyState
            title="No forms submitted yet"
            body="Submit a print request form and it will appear right here."
            action={
              <ButtonLink to="/dashboard/new-order" icon={<FilePlus2 className="h-4 w-4" />}>
                Submit Print Request
              </ButtonLink>
            }
          />
        )}
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? ''}
        description={selected ? `${selected.ref} · ${formatDate(selected.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.status} />
              <Badge tone="gray">{SUBMISSION_KIND_LABEL[selected.kind]}</Badge>
            </div>
            <dl className="divide-y divide-ink-100 rounded-xl border border-ink-100 px-4">
              {[
                ['Service', selected.serviceTitle],
                ['Quantity', selected.quantity ? formatNumber(selected.quantity) : undefined],
                ['Size', selected.size],
                ['Colours', selected.colors],
                ['Material', selected.material],
                ['Needed by', selected.deadline],
                ['Artwork file', selected.artworkName],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-2 py-2.5">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="col-span-2 font-medium text-ink-900">{v}</dd>
                  </div>
                ))}
            </dl>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">Submitted notes</p>
              <p className="whitespace-pre-wrap rounded-xl bg-ink-50 p-3.5 text-ink-800">{selected.notes}</p>
            </div>
            {selected.adminNote && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-sky-900">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Admin note</p>
                <p className="mt-1 whitespace-pre-wrap">{selected.adminNote}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
