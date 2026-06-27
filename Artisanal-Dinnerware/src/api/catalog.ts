import { apiFetch } from "./client";

export interface DiscountTier {
  threshold: number;
  label: string;
  icon: string | null;
  discountPct: number;
  shipping: number;
}

export async function fetchDiscountTiers(): Promise<DiscountTier[]> {
  return apiFetch<DiscountTier[]>("/discount-tiers");
}

export interface BundleOffer {
  slug: string;
  label: string;
  tagline?: string;
  itemCount: number;
  price: number;
}

export async function fetchActiveBundles(): Promise<BundleOffer[]> {
  return apiFetch<BundleOffer[]>("/bundles/active");
}

export interface Announcement {
  id: number;
  text: string;
}

export async function fetchActiveAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>("/announcements/active");
}

export async function fetchCategories() {
  return apiFetch<{ id: number; name: string; slug: string; subtitle?: string; image?: string }[]>("/categories");
}
