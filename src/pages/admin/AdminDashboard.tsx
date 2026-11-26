import { CheckCircle2, Clock, Hourglass, Inbox, Package, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SUBMISSION_KIND_LABEL, SUBMISSION_STATUSES, SUBMISSION_STATUS_LABEL, type SubmissionStatus } from '@shared/constants';
import type { Submission } from '@shared/types';
import { PageHeader } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, DataTable, FilterSelect, SearchInput, StatCard, Tabs } from '@/components/ui/Data';
import { Badge, EmptyState, StatusBadge } from '@/components/ui/Feedback';
import { Textarea } from '@/components/ui/Form';
import { Modal, useConfirm } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { deleteSubmission, listAllSubmissions, subscribeStore, updateSubmissionStatus } from '@/lib/staticStore';
import { formatDate, formatMoney, formatNumber } from '@/lib/utils';

export function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');
  const toast = useToast();
  const confirm = useConfirm();

  const [items, setItems] = useState<Submission[]>(() => listAllSubmissions());
  const [kindFilter, setKindFilter] = useState<'all' | 'print_request' | 'contact_quote'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Submission | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const refresh = () => setItems(listAllSubmissions());
    refresh();
    return subscribeStore(refresh);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((s) => {
      if (kindFilter !== 'all' && s.kind !== kindFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (q && !`${s.ref} ${s.name} ${s.email} ${s.company ?? ''} ${s.subject} ${s.serviceTitle ?? ''}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, kindFilter, statusFilter, query]);

  const counts = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((s) => s.status === 'pending').length,
      active: items.filter((s) => s.status === 'approved' || s.status === 'in_production').length,
      completed: items.filter((s) => s.status === 'completed').length,
    }),
    [items],
  );

  const openModal = (s: Submission) => {
    setOpen(s);
    setNote(s.adminNote ?? '');
  };

  const applyStatus = (status: SubmissionStatus) => {
    if (!open) return;
    const updated = updateSubmissionStatus(open.id, status, note.trim() || undefined);
    if (updated) {
      setOpen(updated);
      setItems(listAllSubmissions());
      toast.success(`${updated.ref} updated to ${SUBMISSION_STATUS_LABEL[status]}`);
    }
  };

  const remove = async () => {
    if (!open) return;
    const ok = await confirm({
      title: `Delete ${open.ref}?`,
      body: 'This submitted form entry will be removed.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    deleteSubmission(open.id);
    setItems(listAllSubmissions());
    setOpen(null);
    toast.success('Submission removed');
  };

  return (
    <>
      <PageHeader
        title="Admin Console"
        description="All print requests and contact quote forms submitted by users appear here."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total submissions" value={formatNumber(counts.total)} icon={<Package className="h-5 w-5" />} />
        <StatCard label="Pending review" value={formatNumber(counts.pending)} icon={<Hourglass className="h-5 w-5" />} accent="yellow" />
        <StatCard label="Approved / In press" value={formatNumber(counts.active)} icon={<Clock className="h-5 w-5" />} accent="violet" />
        <StatCard label="Completed" value={formatNumber(counts.completed)} icon={<CheckCircle2 className="h-5 w-5" />} accent="green" />
      </div>

      <Card className="mt-6" padded={false} title="User submitted forms">
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            value={kindFilter}
            onChange={setKindFilter}
            tabs={[
              { value: 'all', label: 'All', count: items.length },
              { value: 'print_request', label: 'Print Requests', count: items.filter((s) => s.kind === 'print_request').length },
              { value: 'contact_quote', label: 'Contact / Quotes', count: items.filter((s) => s.kind === 'contact_quote').length },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, ref, project" className="sm:w-64" />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: '', label: 'All statuses' },
                ...SUBMISSION_STATUSES.map((st) => ({ value: st, label: SUBMISSION_STATUS_LABEL[st] })),
              ]}
            />
          </div>
        </div>

        {filtered.length ? (
          <DataTable
            caption="User submitted forms"
            rows={filtered}
            rowKey={(s) => s.id}
            onRowClick={openModal}
            columns={[
              { key: 'ref', header: 'Ref', cell: (s) => <span className="font-semibold text-ink-900">{s.ref}</span> },
              {
                key: 'user',
                header: 'Submitted by',
                cell: (s) => (
                  <span>
                    <span className="block max-w-[180px] truncate font-medium text-ink-900">{s.name}</span>
                    <span className="block max-w-[180px] truncate text-xs text-ink-500">{s.email}</span>
                  </span>
                ),
              },
              {
                key: 'type',
                header: 'Form Type',
                cell: (s) => <Badge tone={s.kind === 'print_request' ? 'blue' : 'gray'}>{SUBMISSION_KIND_LABEL[s.kind]}</Badge>,
              },
              {
                key: 'subject',
                header: 'Project / Subject',
                cell: (s) => (
                  <span>
                    <span className="block max-w-[220px] truncate font-medium text-ink-900">{s.subject}</span>
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
            icon={<Inbox className="h-6 w-6" />}
            title="No user submissions yet"
            body="When a user submits the Print Request form or Contact Quote form, every field appears here."
          />
        )}
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        size="lg"
        title={open?.subject ?? ''}
        description={open ? `${open.ref} · ${open.name} · ${formatDate(open.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
        footer={
          <>
            <Button variant="ghost" className="text-red-600 sm:mr-auto" onClick={remove} icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
            {open?.status !== 'approved' && (
              <Button variant="outline" onClick={() => applyStatus('approved')}>
                Approve
              </Button>
            )}
            {open?.status !== 'in_production' && (
              <Button variant="outline" onClick={() => applyStatus('in_production')}>
                In production
              </Button>
            )}
            {open?.status !== 'completed' && (
              <Button onClick={() => applyStatus('completed')}>
                Mark completed
              </Button>
            )}
          </>
        }
      >
        {open && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={open.status} />
              <Badge tone="gray">{SUBMISSION_KIND_LABEL[open.kind]}</Badge>
            </div>

            <dl className="divide-y divide-ink-100 rounded-xl border border-ink-100 px-4">
              {[
                ['Name', open.name],
                ['Email', open.email],
                ['Phone', open.phone],
                ['Company', open.company],
                ['Country', open.country],
                ['Service', open.serviceTitle],
                ['Quantity', open.quantity ? formatNumber(open.quantity) : undefined],
                ['Estimate', open.estimatedTotal != null ? formatMoney(open.estimatedTotal) : undefined],
                ['Size', open.size],
                ['Colours', open.colors],
                ['Material', open.material],
                ['Deadline', open.deadline],
                ['Artwork file', open.artworkName],
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
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">User message / specifications</p>
              <p className="whitespace-pre-wrap rounded-xl bg-ink-50 p-4 leading-relaxed text-ink-800">{open.notes}</p>
            </div>

            <Textarea
              label="Admin note (visible to user)"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write approval confirmation, final pricing or production update…"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
