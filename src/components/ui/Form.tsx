import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'light' | 'dark';

const control = (tone: Tone, invalid?: boolean) =>
  cn(
    'w-full rounded-xl border px-3.5 text-[15px] transition placeholder:text-ink-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
    tone === 'light'
      ? 'border-ink-200 bg-white text-ink-900 focus:border-brand-500 focus:ring-brand-500/15'
      : 'border-white/12 bg-white/[0.06] text-white focus:border-cyan focus:ring-cyan/20',
    invalid && (tone === 'light' ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-red-400 focus:border-red-400 focus:ring-red-400/20'),
  );

interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  tone?: Tone;
  className?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

export function Field({ label, error, hint, required, tone = 'light', className, children }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-medium', tone === 'light' ? 'text-ink-700' : 'text-ink-200')}>
        {label}
        {required && <span className="ml-0.5 text-brand-500" aria-hidden> *</span>}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-err`} className={cn('text-[13px] font-medium', tone === 'light' ? 'text-red-600' : 'text-red-300')} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cn('text-[13px]', tone === 'light' ? 'text-ink-500' : 'text-ink-400')}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode; tone?: Tone; wrapperClassName?: string; leading?: ReactNode };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, tone = 'light', wrapperClassName, leading, className, required, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={wrapperClassName}>
      {(id, describedBy) => (
        <div className="relative">
          {leading && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">{leading}</span>}
          <input ref={ref} id={id} aria-invalid={!!error || undefined} aria-describedby={describedBy} required={required} className={cn(control(tone, !!error), 'h-12', leading && 'pl-10', className)} {...rest} />
        </div>
      )}
    </Field>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(function PasswordInput({ label, error, hint, tone = 'light', wrapperClassName, className, required, ...rest }, ref) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={wrapperClassName}>
      {(id, describedBy) => (
        <div className="relative">
          <input ref={ref} id={id} type={show ? 'text' : 'password'} aria-invalid={!!error || undefined} aria-describedby={describedBy} required={required} className={cn(control(tone, !!error), 'h-12 pr-12', className)} {...rest} />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className={cn('absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg', tone === 'light' ? 'text-ink-500 hover:bg-ink-100' : 'text-ink-300 hover:bg-white/10')}
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
          >
            {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      )}
    </Field>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; hint?: ReactNode; tone?: Tone; wrapperClassName?: string };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, tone = 'light', wrapperClassName, className, required, rows = 4, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={wrapperClassName}>
      {(id, describedBy) => <textarea ref={ref} id={id} rows={rows} aria-invalid={!!error || undefined} aria-describedby={describedBy} required={required} className={cn(control(tone, !!error), 'py-3 leading-relaxed', className)} {...rest} />}
    </Field>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; hint?: ReactNode; tone?: Tone; wrapperClassName?: string; options: { value: string | number; label: string }[]; placeholder?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, hint, tone = 'light', wrapperClassName, className, options, placeholder, required, ...rest }, ref) {
  return (
    <Field label={label} error={error} hint={hint} required={required} tone={tone} className={wrapperClassName}>
      {(id, describedBy) => (
        <select ref={ref} id={id} aria-invalid={!!error || undefined} aria-describedby={describedBy} required={required} className={cn(control(tone, !!error), 'h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2020%2020%27%20fill=%27%237d89ab%27%3E%3Cpath%20d=%27M5.3%207.3a1%201%200%20011.4%200L10%2010.6l3.3-3.3a1%201%200%20111.4%201.4l-4%204a1%201%200%2001-1.4%200l-4-4a1%201%200%20010-1.4z%27/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_12px_center] bg-no-repeat pr-10', className)} {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink-900">
          {label}
        </label>
        {description && <p className="text-sm text-ink-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition', checked ? 'bg-brand-500' : 'bg-ink-200', disabled && 'opacity-50')}
      >
        <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition', checked ? 'translate-x-5.5' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}

/** Editable list of short strings (used by admin forms for bullet lists). */
export function ListEditor({ label, values, onChange, placeholder, error }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string; error?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && values.length < 12) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      <ul className="flex flex-col gap-1.5">
        {values.map((v, i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-sm">
            <span className="flex-1">{v}</span>
            <button type="button" className="text-ink-400 hover:text-red-600" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((_, j) => j !== i))}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? 'Add item and press Enter'}
          aria-label={`Add to ${label}`}
          className={cn(control('light'), 'h-10 flex-1')}
        />
        <button type="button" onClick={add} className="rounded-xl border border-ink-200 px-3 text-sm font-semibold hover:bg-ink-50">
          Add
        </button>
      </div>
      {error && <p className="text-[13px] font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}
