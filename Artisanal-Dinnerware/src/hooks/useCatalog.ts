import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProducts, fetchProductBySlug, fetchCategoryPage, fetchProducts } from "@/api/products";
import { fetchDiscountTiers, fetchActiveBundles, fetchActiveAnnouncements, fetchCategories } from "@/api/catalog";
import { featuredProducts, allProducts, getProductById, getRelatedProducts } from "@/data/products";
import { DEFAULT_DISCOUNT_TIERS } from "@/data/discountTiers";

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
  });
}

export function useCategoryProducts(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => fetchCategoryPage(slug),
    enabled: !!slug,
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: () => fetchProducts({ limit: 100 }),
    staleTime: 5 * 60_000,
  });
}

export function useDiscountTiers() {
  return useQuery({
    queryKey: ["discount-tiers"],
    queryFn: fetchDiscountTiers,
    staleTime: 10 * 60_000,
    placeholderData: DEFAULT_DISCOUNT_TIERS.map((t) => ({ ...t, icon: t.icon })),
  });
}

export function useBundles() {
  return useQuery({
    queryKey: ["bundles"],
    queryFn: fetchActiveBundles,
    staleTime: 10 * 60_000,
    placeholderData: [
      { slug: "trio", label: "Pick Any 3", tagline: "₹999 bundle", itemCount: 3, price: 999 },
      { slug: "five", label: "Pick Any 5", tagline: "₹1499 bundle", itemCount: 5, price: 1499 },
    ],
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: fetchActiveAnnouncements,
    staleTime: 5 * 60_000,
    placeholderData: [
      { id: 1, text: "Free shipping on orders above ₹999" },
      { id: 2, text: "Handcrafted ceramics — kiln-fired at 1260°C" },
    ],
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 60_000,
  });
}
