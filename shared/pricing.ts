import type { PriceTier } from './types';

/** Unit price for a quantity: the tier with the highest minQty that the quantity reaches. */
export function unitPriceFor(tiers: PriceTier[], quantity: number): number | null {
  if (!tiers.length) return null;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let price = sorted[0].unitPrice;
  for (const t of sorted) if (quantity >= t.minQty) price = t.unitPrice;
  return price;
}

/** Indicative estimate shown before the factory reviews artwork. Rounded to cents. */
export function estimateTotal(tiers: PriceTier[], setupFee: number, quantity: number): number {
  const unit = unitPriceFor(tiers, quantity) ?? 0;
  return Math.round((unit * quantity + setupFee) * 100) / 100;
}

export function formatMoney(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: value < 10 ? 3 : 2 }).format(value);
}
