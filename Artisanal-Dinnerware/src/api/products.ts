import type { Product } from "@/data/products";
import { apiFetch, apiFetchPaginated } from "./client";

interface ApiProduct {
  id: number;
  slug: string;
  name: string;
  price: number;
  salePrice?: number | null;
  shortDescription?: string;
  longDescription?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  careInstructions?: string[];
  features?: string[];
  tags?: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;
  image?: string | null;
  images?: { url: string; isPrimary: boolean }[];
  category?: { slug: string; name: string };
  related?: ApiProduct[];
}

export function mapApiProduct(p: ApiProduct): Product {
  const images = p.images?.map((i) => i.url) ?? (p.image ? [p.image] : []);
  return {
    id: p.slug || String(p.id),
    name: p.name,
    price: p.salePrice ?? p.price,
    originalPrice: p.salePrice ? p.price : undefined,
    category: p.category?.slug ?? "drinkware",
    image: p.image ?? images[0] ?? "",
    images: images.length ? images : undefined,
    tag: p.tags?.[0],
    description: p.shortDescription,
    longDescription: p.longDescription,
    material: p.material,
    dimensions: p.dimensions,
    weight: p.weight,
    careInstructions: p.careInstructions,
    features: p.features,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    stockCount: p.stockCount,
  };
}

export async function fetchProducts(params?: Record<string, string | number>) {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => qs.set(k, String(v)));
  }
  const result = await apiFetchPaginated<ApiProduct>(`/products?${qs}`);
  return { ...result, data: result.data.map(mapApiProduct) };
}

export async function fetchFeaturedProducts() {
  const data = await apiFetch<ApiProduct[]>("/products/featured");
  return data.map(mapApiProduct);
}

export async function fetchProductBySlug(slug: string) {
  const data = await apiFetch<ApiProduct & { related?: ApiProduct[] }>(`/products/${slug}`);
  const product = mapApiProduct(data);
  const related = data.related?.map(mapApiProduct) ?? [];
  return { product, related };
}

export async function fetchCategoryPage(slug: string, page = 1) {
  const data = await apiFetch<{
    category: { slug: string; name: string; subtitle?: string; heroImage?: string; heroTitle?: string };
    products: ApiProduct[];
    meta: { total: number; page: number; limit: number };
  }>(`/categories/slug/${slug}/page?page=${page}`);
  return {
    category: data.category,
    products: data.products.map(mapApiProduct),
    meta: data.meta,
  };
}
