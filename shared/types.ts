import type { Role, SubmissionKind, SubmissionStatus, VisualKey } from './constants';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  country?: string;
  createdAt: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
}

export interface PriceTier {
  minQty: number;
  unitPrice: number;
}

export interface Service {
  id: number;
  slug: string;
  title: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  visual: VisualKey;
  applications: string[];
  specs: { label: string; value: string }[];
  unit: string;
  minQty: number;
  leadTime: string;
  setupFee: number;
  active: boolean;
  featured: boolean;
  tiers: PriceTier[];
  priceFrom: number | null;
}

export interface SiteContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutIntro: string;
  mission: string;
  vision: string;
  ctaTitle: string;
  ctaSubtitle: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
}

export interface PublicSite {
  content: SiteContent;
  categories: Category[];
  services: Service[];
}

export interface Submission {
  id: string;
  ref: string;
  kind: SubmissionKind;
  status: SubmissionStatus;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  serviceId?: number;
  serviceTitle?: string;
  subject: string;
  quantity?: number;
  size?: string;
  colors?: string;
  material?: string;
  deadline?: string;
  notes: string;
  artworkName?: string;
  estimatedTotal?: number | null;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}
