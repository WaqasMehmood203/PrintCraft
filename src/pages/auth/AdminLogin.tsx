import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { fieldErrors, loginSchema } from '@shared/schemas';
import { BrandLogo } from '@/components/layout/Brand';
import { Button } from '@/components/ui/Button';
import { FormError, Input, PasswordInput } from '@/components/ui/Form';
import { Photo } from '@/components/visuals/ProductVisual';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { DEMO_ACCOUNTS, StoreError } from '@/lib/staticStore';

export function AdminLoginPage() {
  useDocumentTitle('Admin Sign In');
  const { user, login, quickSignIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ ...form, portal: 'admin' });
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setBusy(true);
    try {
      await login(parsed.data);
      toast.success('Signed in to Admin Panel');
      navigate('/admin', { replace: true });
    } catch (err) {
      const s = err as StoreError;
      setErrors(s.fields ?? {});
      setFormError(s.message);
    } finally {
      setBusy(false);
    }
  };

  const handleQuickAdmin = () => {
    quickSignIn('admin');
    toast.success('Signed in as Admin');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <BrandLogo dark={false} />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" /> Website
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <p className="inline-flex items-center gap-2 rounded-md bg-ink-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Role
            </p>
            <h1 className="display mt-4 text-4xl text-ink-900">Admin Console</h1>
            <p className="mt-1.5 text-sm text-ink-500">Sign in to view all user-submitted forms and manage requests.</p>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper px-4 py-3 text-xs text-ink-600">
              <div>
                <p className="font-semibold text-ink-900">Admin credentials</p>
                <p className="mt-0.5">{DEMO_ACCOUNTS.admin.email} · {DEMO_ACCOUNTS.admin.password}</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleQuickAdmin} icon={<Sparkles className="h-3.5 w-3.5" />}>
                Quick Enter
              </Button>
            </div>

            {user?.role === 'user' && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Currently signed in as User. Use Quick Enter above or sign in below to switch to Admin.
              </p>
            )}

            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
              <FormError message={formError} />
              <Input label="Admin email" type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
              <PasswordInput label="Password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
              <Button type="submit" size="lg" loading={busy} className="mt-2 w-full" variant="secondary">
                Sign in as Admin
              </Button>
            </form>
            <p className="mt-6 text-sm text-ink-500">
              Regular user?{' '}
              <Link to="/login" className="font-semibold text-ink-900 hover:underline">
                User sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <Photo name="offset-press" alt="" priority sizes="55vw" imgClassName="animate-kenburns" />
        <div className="absolute inset-0 bg-ink-950/35" />
      </div>
    </div>
  );
}
