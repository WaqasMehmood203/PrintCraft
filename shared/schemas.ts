import { z } from 'zod';
import { SUBMISSION_STATUSES } from './constants';

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .or(z.literal('').transform(() => undefined));

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .max(160);

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(6, 'Use at least 6 characters')
  .max(128, 'Use at most 128 characters');

const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+()\d\s-]*$/, 'Use digits, spaces, +, - or brackets only')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const registerSchema = z.object({
  name: trimmed(2, 80, 'Full name'),
  email: emailSchema,
  password: passwordSchema,
  company: optionalText(120),
  phone: phoneSchema,
  country: optionalText(80),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
  portal: z.enum(['user', 'admin']).default('user'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const contactFormSchema = z.object({
  name: trimmed(2, 80, 'Name'),
  email: emailSchema,
  phone: phoneSchema,
  company: optionalText(120),
  serviceTitle: optionalText(100),
  subject: trimmed(3, 140, 'Subject'),
  quantity: z.coerce.number().int().min(1).max(1_000_000).optional().or(z.literal('').transform(() => undefined)),
  notes: trimmed(8, 2000, 'Message'),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const printRequestSchema = z.object({
  serviceId: z.coerce.number().int().positive('Choose a printing service'),
  subject: trimmed(3, 120, 'Project title'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Enter a quantity' })
    .int('Use a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(1_000_000, 'For 1,000,000+ pieces please contact sales'),
  size: optionalText(80),
  colors: optionalText(80),
  material: optionalText(120),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  country: optionalText(80),
  notes: trimmed(4, 2000, 'Print details'),
  artworkName: optionalText(160),
});
export type PrintRequestInput = z.infer<typeof printRequestSchema>;

export const submissionUpdateSchema = z.object({
  status: z.enum(SUBMISSION_STATUSES),
  adminNote: optionalText(1000),
});

/** Flattens a ZodError into { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
