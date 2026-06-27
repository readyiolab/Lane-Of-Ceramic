import { z } from "zod";

// ── Query schemas ──────────────────────────────────────────────

export const productListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  sort: z
    .enum(["featured", "price-asc", "price-desc", "rating", "name-asc", "name-desc", "newest"])
    .default("featured")
    .optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  q: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.enum(["true", "false"]).optional(),
  onSale: z.enum(["true", "false"]).optional(),
  tag: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  rating: z.coerce.number().min(1).max(5).optional(),
});

export const productSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const productImageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().optional(),
  position: z.coerce.number().int().optional(),
});

export const productVariantSchema = z.object({
  sku: z.string().min(2).max(80),
  color: z.string().max(80).optional(),
  size: z.string().max(80).optional(),
  packSize: z.string().max(80).optional(),
  priceDelta: z.coerce.number().optional(),
  stockCount: z.coerce.number().int().min(0).optional(),
});

export const imageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  imageId: z.coerce.number().int().positive(),
});

export const variantIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
});

// ── Admin create/update schemas ────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(2).max(180),
  sku: z.string().min(2).max(80),
  shortDescription: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  material: z.string().max(150).optional(),
  dimensions: z.string().max(150).optional(),
  weight: z.string().max(80).optional(),
  careInstructions: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  categoryId: z.coerce.number().int().positive(),
  brandId: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive(),
  salePrice: z.coerce.number().positive().optional(),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  featuredRank: z.coerce.number().int().default(999),
  stockCount: z.coerce.number().int().min(0).default(0),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(190).optional(),
  seoDescription: z.string().max(255).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
