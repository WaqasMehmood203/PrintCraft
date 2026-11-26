import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { fieldErrors, loginSchema, registerSchema } from '@shared/schemas';
import { BrandLogo } from '@/components/layout/Brand';
import { Button } from '@/components/ui/Button';
import { FormError, Input, PasswordInput } from '@/components/ui/Form';
import { Photo } from '@/components/visuals/ProductVisual';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDocumentTitle } from '@/hooks/useAsync';
import { DEMO_ACCOUNTS, StoreError } from '@/lib/staticStore';
import { cn } from '@/lib/utils';

function safeNext(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith('/dashboard')) return null;
  if (raw.startsWith('//') || raw.includes('\\')) return null;
  return raw;
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  useDocumentTitle(mode === 'login' ? 'User Sign In' : 'Create User Account');
  const { user, login, register, quickSignIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next')) ?? safeNext((location.state as { from?: string } | null)?.from);

  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', phone: '', country: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setErrors({});
    setFormError(null);
  }, [mode]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }));
  };

  if (user) return <Navigate to={next ?? '/dashboard'} replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const schema = mode === 'login' ? loginSchema : registerSchema;
    const parsed = schema.safeParse(mode === 'login' ? { email: form.email, password: form.password, portal: 'user' } : form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    try {
      const u = mode === 'login' ? await login(parsed.data as never) : await register(parsed.data as never);
      toast.success(mode === 'login' ? `Welcome, ${u.name}` : 'User account created');
      navigate(next ?? '/dashboard', { replace: true });
    } catch (err) {
      const s = err as StoreError;
      setErrors(s.fields ?? {});
      setFormError(s.message);
    } finally {
      setBusy(false);
    }
  };

  const handleQuickUser = () => {
    const u = quickSignIn('user');
    toast.success(`Signed in as ${u.name}`);
    navigate(next ?? '/dashboard', { replace: true });
  };

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <Photo name={mode === 'login' ? 'gloved-squeegee' : 'press-operators'} alt="" priority sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/35 to-ink-950/40" />
        <div className="absolute inset-x-0 top-0 p-10">
          <BrandLogo />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <p className="display max-w-md text-[2.5rem] leading-[1.1] text-white">Submit your print specs and track approval.</p>
          <ul className="mt-5 space-y-2 text-[15px] text-white/80">
            {['Clear minimum order quantities', 'Direct print specification submission', 'Live status tracking'].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 sm:p-8">
          <div className="lg:hidden">
            <BrandLogo dark={false} />
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link to="/" className="inline-flex items-center gap-1.5 font-medium text-ink-500 hover:text-ink-900">
              <ArrowLeft className="h-4 w-4" /> Website
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="relative mb-8 grid grid-cols-2 rounded-lg bg-ink-100/80 p-1" role="tablist">
              {(['login', 'register'] as const).map((m) => (
                <Link
                  key={m}
                  to={m === 'login' ? `/login${location.search}` : `/register${location.search}`}
                  replace
                  role="tab"
                  aria-selected={mode === m}
                  className={cn('relative z-10 rounded-md py-2.5 text-center text-sm font-semibold transition', mode === m ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900')}
                >
                  {mode === m && <motion.span layoutId="auth-pill" className="absolute inset-0 -z-10 rounded-md bg-white shadow-sm" transition={{ type: 'spring', damping: 30, stiffness: 350 }} />}
                  {m === 'login' ? 'User Sign In' : 'Register'}
                </Link>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={mode} initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <h1 className="display text-4xl text-ink-900">{mode === 'login' ? 'User Portal' : 'Create User Account'}</h1>
                <p className="mt-1.5 text-sm text-ink-500">
                  {mode === 'login' ? 'Sign in to submit print forms and view status.' : 'Register to submit and track print requests.'}
                </p>

                {mode === 'login' && (
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper px-4 py-3 text-xs text-ink-600">
                    <div>
                      <p className="font-semibold text-ink-900">User credentials</p>
                      <p className="mt-0.5">{DEMO_ACCOUNTS.user.email} · {DEMO_ACCOUNTS.user.password}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleQuickUser} icon={<Sparkles className="h-3.5 w-3.5" />}>
                      Quick Enter
                    </Button>
                  </div>
                )}

                <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
                  <FormError message={formError} />
                  {mode === 'register' && <Input label="Full name" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />}
                  <Input label="Email" type="email" required autoComplete="email" leading={<Mail className="h-4 w-4" />} value={form.email} onChange={set('email')} error={errors.email} />
                  <PasswordInput label="Password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={set('password')} error={errors.password} />
                  {mode === 'register' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Company" autoComplete="organization" value={form.company} onChange={set('company')} error={errors.company} />
                      <Input label="Phone" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
                    </div>
                  )}
                  <Button type="submit" size="lg" loading={busy} iconRight={<ArrowRight className="h-5 w-5" />} className="mt-2 w-full">
                    {mode === 'login' ? 'Sign in as User' : 'Create Account'}
                  </Button>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
