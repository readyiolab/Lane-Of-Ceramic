export interface DiscountTier {
  threshold: number;
  label: string;
  icon: string;
  discountPct: number;
  shipping: number;
}

export const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { threshold: 0, label: "Standard Shipping", icon: "📦", discountPct: 0, shipping: 99 },
  { threshold: 999, label: "Free Shipping", icon: "🚚", discountPct: 0, shipping: 0 },
  { threshold: 1550, label: "Flat 15% Discount", icon: "🎁", discountPct: 15, shipping: 0 },
  { threshold: 2500, label: "Flat 20% Discount", icon: "🔥", discountPct: 20, shipping: 0 },
];
