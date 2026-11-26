// Shared constants for the static PrintCraft application.

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const SUBMISSION_STATUSES = [
  'pending',
  'approved',
  'in_production',
  'completed',
  'rejected',
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: 'Pending review',
  approved: 'Approved',
  in_production: 'In production',
  completed: 'Completed',
  rejected: 'Rejected',
};

export const SUBMISSION_KINDS = ['print_request', 'contact_quote'] as const;
export type SubmissionKind = (typeof SUBMISSION_KINDS)[number];

export const SUBMISSION_KIND_LABEL: Record<SubmissionKind, string> = {
  print_request: 'Print Request',
  contact_quote: 'Contact / Quote',
};

/** Photo keys matching self-hosted stock photography in public/stock/photos. */
export const VISUAL_KEYS = [
  'hero-screen-printer',
  'offset-press',
  'press-rollers',
  'web-press',
  'press-hall',
  'press-operators',
  'large-format',
  'paper-cutter',
  'conveyor',
  'squeegee',
  'gloved-squeegee',
  'screen-yellow',
  'screen-machine',
  'ink-closeup',
  'screen-frame',
  'tshirt-press',
  'folded-shirts',
  'shirt-rack',
  'hang-tag',
  'loupe-cmyk',
  'swatches',
  'pantone',
  'paper-stock',
  'trimmer',
  'cards-marble',
  'cards-black',
  'cards-color',
  'brochure-stand',
  'brochures',
  'posters',
  'wide-printer',
  'boxes-printed',
  'boxes-pastel',
  'kraft-box',
  'packing',
  'warehouse',
  'stickers-wall',
  'stickers',
  'letterpress',
  'garment-line',
  'heat-press-hands',
  'heat-press-shirt',
  'knit-label',
  'neck-label',
  'denim-patch',
  'woven-patch',
  'rubber-patch',
  'reflective',
  'garment-factory',
  'hoodie-print',
  'printed-tee',
  'letterhead',
  'gift-box',
] as const;
export type VisualKey = (typeof VISUAL_KEYS)[number];

export const ICON_KEYS = [
  'Tag', 'Layers', 'Shield', 'Printer', 'Newspaper', 'Package', 'Sparkles', 'Shirt', 'FileText', 'Palette',
] as const;
