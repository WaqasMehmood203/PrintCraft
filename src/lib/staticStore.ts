import type { Role, SubmissionStatus } from '@shared/constants';
import { estimateTotal } from '@shared/pricing';
import type { ContactFormInput, LoginInput, PrintRequestInput, RegisterInput } from '@shared/schemas';
import type { PublicSite, Service, Submission, User } from '@shared/types';
import { CATEGORIES, DEFAULT_SERVICES, SITE_CONTENT } from '@/data/siteData';

const KEYS = {
  users: 'pc_static_users_v1',
  session: 'pc_static_session_v1',
  submissions: 'pc_static_submissions_v1',
  services: 'pc_static_services_v1',
};

export const DEMO_ACCOUNTS = {
  user: { email: 'user@printcraft.com', password: 'user1234' },
  admin: { email: 'admin@printcraft.com', password: 'admin1234' },
} as const;

interface StoredUser extends User {
  password: string;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'usr-user-1',
    role: 'user',
    name: 'PrintCraft User',
    email: DEMO_ACCOUNTS.user.email,
    password: DEMO_ACCOUNTS.user.password,
    company: 'Studio Apparel',
    phone: '+92 300 000 0000',
    country: 'Pakistan',
    createdAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'usr-admin-1',
    role: 'admin',
    name: 'PrintCraft Admin',
    email: DEMO_ACCOUNTS.admin.email,
    password: DEMO_ACCOUNTS.admin.password,
    company: 'PrintCraft International',
    country: 'Pakistan',
    createdAt: '2026-01-01T09:00:00.000Z',
  },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('pc:store-updated', { detail: { key } }));
  } catch {
    /* storage quota or private mode */
  }
}

function stripPassword(u: StoredUser): User {
  const { password: _pw, ...rest } = u;
  return rest;
}

function loadUsers(): StoredUser[] {
  const stored = readJson<StoredUser[] | null>(KEYS.users, null);
  if (!stored || !stored.length) {
    writeJson(KEYS.users, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return stored;
}

export class StoreError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

// ---------- Auth (User & Admin) ----------

export function getCurrentUser(): User | null {
  const sessionId = readJson<string | null>(KEYS.session, null);
  if (!sessionId) return null;
  const user = loadUsers().find((u) => u.id === sessionId);
  return user ? stripPassword(user) : null;
}

export function loginUser(input: LoginInput): User {
  const users = loadUsers();
  const found = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (!found || found.password !== input.password) {
    throw new StoreError('Invalid email or password.');
  }
  if (input.portal === 'admin' && found.role !== 'admin') {
    throw new StoreError('This portal is for Admin accounts. Use User sign in instead.');
  }
  if (input.portal === 'user' && found.role === 'admin') {
    throw new StoreError('Admin accounts sign in on the Admin portal.');
  }
  writeJson(KEYS.session, found.id);
  return stripPassword(found);
}

export function registerUser(input: RegisterInput): User {
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new StoreError('An account with this email already exists.', { email: 'Already registered' });
  }
  const created: StoredUser = {
    id: `usr-${Date.now().toString(36)}`,
    role: 'user',
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    company: input.company,
    phone: input.phone,
    country: input.country,
    createdAt: new Date().toISOString(),
  };
  writeJson(KEYS.users, [...users, created]);
  writeJson(KEYS.session, created.id);
  return stripPassword(created);
}

export function logoutUser() {
  window.localStorage.removeItem(KEYS.session);
  window.dispatchEvent(new CustomEvent('pc:store-updated', { detail: { key: KEYS.session } }));
}

export function quickSwitchRole(role: Role): User {
  const users = loadUsers();
  const match = users.find((u) => u.role === role) ?? DEFAULT_USERS.find((u) => u.role === role)!;
  writeJson(KEYS.session, match.id);
  return stripPassword(match);
}

// ---------- Static Site & Services ----------

export function getServices(includeInactive = false): Service[] {
  const saved = readJson<Service[] | null>(KEYS.services, null);
  const list = saved && saved.length ? saved : DEFAULT_SERVICES;
  return includeInactive ? list : list.filter((s) => s.active);
}

export function getPublicSite(): PublicSite {
  return {
    content: SITE_CONTENT,
    categories: CATEGORIES,
    services: getServices(false),
  };
}

export function toggleServiceActive(id: number): Service[] {
  const next = getServices(true).map((s) => (s.id === id ? { ...s, active: !s.active } : s));
  writeJson(KEYS.services, next);
  return next;
}

// ---------- User Form Submissions (Shown in Admin) ----------

export function listAllSubmissions(): Submission[] {
  return readJson<Submission[]>(KEYS.submissions, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listUserSubmissions(user: User): Submission[] {
  return listAllSubmissions().filter((s) => s.userId === user.id || s.email.toLowerCase() === user.email.toLowerCase());
}

function nextRef(prefix: string, existing: Submission[]): string {
  const num = existing.length + 101;
  return `${prefix}-${num}`;
}

export function submitPrintRequest(user: User, input: PrintRequestInput): Submission {
  const service = getServices(true).find((s) => s.id === input.serviceId);
  if (!service) {
    throw new StoreError('Please select a valid printing service.', { serviceId: 'Choose a service' });
  }
  if (input.quantity < service.minQty) {
    throw new StoreError(`Minimum order for ${service.title} is ${service.minQty} ${service.unit}s.`, {
      quantity: `Minimum is ${service.minQty}`,
    });
  }
  const existing = listAllSubmissions();
  const now = new Date().toISOString();
  const est = estimateTotal(service.tiers, service.setupFee, input.quantity);
  const item: Submission = {
    id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ref: nextRef('REQ', existing),
    kind: 'print_request',
    status: 'pending',
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    company: user.company,
    country: input.country ?? user.country,
    serviceId: service.id,
    serviceTitle: service.title,
    subject: input.subject,
    quantity: input.quantity,
    size: input.size,
    colors: input.colors,
    material: input.material,
    deadline: input.deadline,
    notes: input.notes,
    artworkName: input.artworkName,
    estimatedTotal: est,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(KEYS.submissions, [item, ...existing]);
  return item;
}

export function submitContactQuote(input: ContactFormInput, user?: User | null): Submission {
  const existing = listAllSubmissions();
  const now = new Date().toISOString();
  const item: Submission = {
    id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ref: nextRef('QT', existing),
    kind: 'contact_quote',
    status: 'pending',
    userId: user?.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    company: input.company,
    serviceTitle: input.serviceTitle,
    subject: input.subject,
    quantity: input.quantity,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  writeJson(KEYS.submissions, [item, ...existing]);
  return item;
}

export function updateSubmissionStatus(id: string, status: SubmissionStatus, adminNote?: string): Submission | null {
  const existing = listAllSubmissions();
  let updated: Submission | null = null;
  const next = existing.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      status,
      adminNote: adminNote !== undefined ? adminNote : item.adminNote,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  if (updated) writeJson(KEYS.submissions, next);
  return updated;
}

export function deleteSubmission(id: string) {
  const next = listAllSubmissions().filter((item) => item.id !== id);
  writeJson(KEYS.submissions, next);
}

export function subscribeStore(cb: () => void): () => void {
  const onStorage = () => cb();
  const onCustom = () => cb();
  window.addEventListener('storage', onStorage);
  window.addEventListener('pc:store-updated', onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('pc:store-updated', onCustom);
  };
}
