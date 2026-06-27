import { db } from "../../database/mysql.js";
import { cacheGet, cacheSet, cacheInvalidatePattern } from "../../database/redis.js";
import { AppError } from "../../common/api-error.js";
import { slugify, uniqueSlug } from "../../utils/slug.js";
import { parsePagination } from "../../utils/pagination.js";
import { createModuleLogger } from "../../utils/logger.js";
import { CACHE_TTL, CACHE_KEY } from "../../config/constants.js";
import type { ProductListQuery, CreateProductInput, UpdateProductInput } from "./products.validator.js";

const log = createModuleLogger("product-service");

const PRODUCT_LIST_COLUMNS = `
  p.id, p.sku, p.name, p.slug, p.short_description, p.price, p.sale_price,
  p.rating, p.review_count, p.in_stock, p.stock_count, p.is_featured,
  p.is_trending, p.featured_rank, p.features, p.created_at
`;

function mapProductRow(row: any) {
  return {
    id: Number(row.id),
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : null,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    inStock: Boolean(row.in_stock),
    stockCount: Number(row.stock_count),
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    featuredRank: Number(row.featured_rank),
    features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
    createdAt: row.created_at,
    category: {
      id: Number(row.categoryId),
      name: row.categoryName,
      slug: row.categorySlug,
    },
    brand: row.brandId ? {
      id: Number(row.brandId),
      name: row.brandName,
      slug: row.brandSlug,
    } : null,
    image: row.imageUrl ?? null,
  };
}

async function getProductDetailHelper(productId: bigint | number) {
  const row = await db.query(`
    SELECT p.*,
           c.id as categoryId, c.name as categoryName, c.slug as categorySlug,
           b.id as brandId, b.name as brandName, b.slug as brandSlug
    FROM ec_products p
    LEFT JOIN ec_categories c ON p.category_id = c.id
    LEFT JOIN ec_brands b ON p.brand_id = b.id
    WHERE p.id = ? AND p.deleted_at IS NULL
  `, [productId]);

  if (!row) return null;

  const images = await db.queryAll(`
    SELECT id, url, is_primary as isPrimary, position
    FROM ec_product_images
    WHERE product_id = ?
    ORDER BY position ASC
  `, [productId]);

  const variants = await db.queryAll(`
    SELECT id, sku, color, size, pack_size as packSize, price_delta as priceDelta, stock_count as stockCount
    FROM ec_product_variants
    WHERE product_id = ?
  `, [productId]);

  return {
    id: Number(row.id),
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    material: row.material,
    dimensions: row.dimensions,
    weight: row.weight,
    careInstructions: typeof row.care_instructions === "string" ? JSON.parse(row.care_instructions) : row.care_instructions,
    features: typeof row.features === "string" ? JSON.parse(row.features) : row.features,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags ?? []),
    price: Number(row.price),
    salePrice: row.sale_price ? Number(row.sale_price) : null,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    inStock: Boolean(row.in_stock),
    stockCount: Number(row.stock_count),
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    category: {
      id: Number(row.categoryId),
      name: row.categoryName,
      slug: row.categorySlug,
    },
    brand: row.brandId ? {
      id: Number(row.brandId),
      name: row.brandName,
      slug: row.brandSlug,
    } : null,
    images: images.map((img) => ({
      id: Number(img.id),
      url: img.url,
      isPrimary: Boolean(img.isPrimary),
      position: Number(img.position),
    })),
    variants: variants.map((v) => ({
      id: Number(v.id),
      sku: v.sku,
      color: v.color,
      size: v.size,
      packSize: v.packSize,
      priceDelta: Number(v.priceDelta),
      stockCount: Number(v.stockCount),
    })),
  };
}

export const productService = {
  /**
   * List products with filtering, sorting, searching, and pagination.
   */
  async list(query: ProductListQuery) {
    const { page, limit, skip } = parsePagination(query as Record<string, unknown>);

    const cacheKey = `${CACHE_KEY.PRODUCTS_LIST}${JSON.stringify({ ...query, page, limit })}`;
    const cached = await cacheGet<{ data: any[]; total: number }>(cacheKey);
    if (cached) return { ...cached, page, limit };

    const whereClauses: string[] = ["p.deleted_at IS NULL"];
    const params: any[] = [];

    if (query.category) {
      whereClauses.push("c.slug = ?");
      params.push(query.category);
    }
    if (query.brand) {
      whereClauses.push("b.slug = ?");
      params.push(query.brand);
    }
    if (query.minPrice !== undefined) {
      whereClauses.push("p.price >= ?");
      params.push(query.minPrice);
    }
    if (query.maxPrice !== undefined) {
      whereClauses.push("p.price <= ?");
      params.push(query.maxPrice);
    }
    if (query.inStock === "true") {
      whereClauses.push("p.in_stock = TRUE");
    }
    if (query.onSale === "true") {
      whereClauses.push("p.sale_price IS NOT NULL");
    }
    if (query.rating) {
      whereClauses.push("p.rating >= ?");
      params.push(query.rating);
    }
    if (query.tag) {
      whereClauses.push("JSON_CONTAINS(p.features, JSON_QUOTE(?))");
      params.push(query.tag);
    }
    if (query.q) {
      const searchPattern = `%${query.q.trim()}%`;
      whereClauses.push("(p.name LIKE ? OR p.short_description LIKE ? OR p.long_description LIKE ?)");
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereSQL = whereClauses.join(" AND ");

    let sortSQL = "p.created_at DESC";
    if (query.sort) {
      const s = query.sort.toLowerCase();
      if (s.includes("price_asc") || s.includes("price-asc")) sortSQL = "p.price ASC";
      else if (s.includes("price_desc") || s.includes("price-desc")) sortSQL = "p.price DESC";
      else if (s.includes("rating")) sortSQL = "p.rating DESC";
      else if (s.includes("popular")) sortSQL = "p.review_count DESC";
    }

    const dataSql = `
      SELECT ${PRODUCT_LIST_COLUMNS},
             c.id as categoryId, c.name as categoryName, c.slug as categorySlug,
             b.id as brandId, b.name as brandName, b.slug as brandSlug,
             pi.url as imageUrl
      FROM ec_products p
      LEFT JOIN ec_categories c ON p.category_id = c.id
      LEFT JOIN ec_brands b ON p.brand_id = b.id
      LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE ${whereSQL}
      ORDER BY ${sortSQL}
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countJoins: string[] = [];
    if (query.category) {
      countJoins.push("LEFT JOIN ec_categories c ON p.category_id = c.id");
    }
    if (query.brand) {
      countJoins.push("LEFT JOIN ec_brands b ON p.brand_id = b.id");
    }

    const countSql = `
      SELECT COUNT(*) as total
      FROM ec_products p
      ${countJoins.join(" ")}
      WHERE ${whereSQL}
    `;

    const [rows, countRes] = await Promise.all([
      db.queryAll(dataSql, params),
      db.query(countSql, params),
    ]);

    const total = Number(countRes?.total ?? 0);
    const products = rows.map(mapProductRow);

    await cacheSet(cacheKey, { data: products, total }, CACHE_TTL.PRODUCTS_LIST);
    return { data: products, total, page, limit };
  },

  /**
   * Get product detail by slug.
   */
  async getBySlug(slug: string) {
    const cacheKey = `${CACHE_KEY.PRODUCT}${slug}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const row = await db.query(`
      SELECT id FROM ec_products WHERE slug = ? AND deleted_at IS NULL
    `, [slug]);

    if (!row) {
      throw AppError.notFound("Product");
    }

    const productId = BigInt(row.id);
    const product = await getProductDetailHelper(productId);

    if (!product) {
      throw AppError.notFound("Product");
    }

    // Fetch related products (same category, different id)
    const relatedRows = await db.queryAll(`
      SELECT ${PRODUCT_LIST_COLUMNS}, pi.url as imageUrl
      FROM ec_products p
      LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.category_id = ? AND p.id != ? AND p.deleted_at IS NULL
      ORDER BY p.featured_rank ASC
      LIMIT 8
    `, [product.category.id, productId]);

    const related = relatedRows.map((r) => ({
      id: Number(r.id),
      sku: r.sku,
      name: r.name,
      slug: r.slug,
      shortDescription: r.short_description,
      price: Number(r.price),
      salePrice: r.sale_price ? Number(r.sale_price) : null,
      rating: Number(r.rating),
      reviewCount: Number(r.review_count),
      inStock: Boolean(r.in_stock),
      stockCount: Number(r.stock_count),
      isFeatured: Boolean(r.is_featured),
      isTrending: Boolean(r.is_trending),
      featuredRank: Number(r.featured_rank),
      features: typeof r.features === "string" ? JSON.parse(r.features) : r.features,
      createdAt: r.created_at,
      image: r.imageUrl ?? null,
    }));

    const result = {
      ...product,
      related,
    };

    await cacheSet(cacheKey, result, CACHE_TTL.PRODUCT_DETAIL);
    return result;
  },

  /**
   * Get featured products.
   */
  async getFeatured(limit = 8) {
    const cacheKey = CACHE_KEY.FEATURED;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const sql = `
      SELECT ${PRODUCT_LIST_COLUMNS},
             c.id as categoryId, c.name as categoryName, c.slug as categorySlug,
             b.id as brandId, b.name as brandName, b.slug as brandSlug,
             pi.url as imageUrl
      FROM ec_products p
      LEFT JOIN ec_categories c ON p.category_id = c.id
      LEFT JOIN ec_brands b ON p.brand_id = b.id
      LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.is_featured = TRUE AND p.deleted_at IS NULL AND p.in_stock = TRUE
      ORDER BY p.featured_rank ASC
      LIMIT ${limit}
    `;
    const rows = await db.queryAll(sql);
    const result = rows.map(mapProductRow);

    await cacheSet(cacheKey, result, CACHE_TTL.FEATURED_PRODUCTS);
    return result;
  },

  /**
   * Get trending products.
   */
  async getTrending(limit = 8) {
    const cacheKey = CACHE_KEY.TRENDING;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const sql = `
      SELECT ${PRODUCT_LIST_COLUMNS},
             c.id as categoryId, c.name as categoryName, c.slug as categorySlug,
             b.id as brandId, b.name as brandName, b.slug as brandSlug,
             pi.url as imageUrl
      FROM ec_products p
      LEFT JOIN ec_categories c ON p.category_id = c.id
      LEFT JOIN ec_brands b ON p.brand_id = b.id
      LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE p.is_trending = TRUE AND p.deleted_at IS NULL AND p.in_stock = TRUE
      ORDER BY p.review_count DESC
      LIMIT ${limit}
    `;
    const rows = await db.queryAll(sql);
    const result = rows.map(mapProductRow);

    await cacheSet(cacheKey, result, CACHE_TTL.FEATURED_PRODUCTS);
    return result;
  },

  /**
   * Admin: Create product.
   */
  async create(input: CreateProductInput) {
    let slug = slugify(input.name);

    // Check for slug collision
    const exists = await db.select("products", "id", "slug = ?", [slug]);
    if (exists) slug = uniqueSlug(input.name);

    const result = await db.insert("products", {
      sku: input.sku,
      name: input.name,
      slug,
      short_description: input.shortDescription ?? null,
      long_description: input.longDescription ?? null,
      material: input.material ?? null,
      dimensions: input.dimensions ?? null,
      weight: input.weight ?? null,
      care_instructions: JSON.stringify(input.careInstructions ?? []),
      features: JSON.stringify(input.features ?? []),
      category_id: BigInt(input.categoryId),
      brand_id: input.brandId ? BigInt(input.brandId) : null,
      price: input.price,
      sale_price: input.salePrice ?? null,
      is_featured: input.isFeatured ?? false,
      is_trending: input.isTrending ?? false,
      featured_rank: input.featuredRank ?? 999,
      stock_count: input.stockCount ?? 0,
      in_stock: (input.stockCount ?? 0) > 0,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      tags: JSON.stringify(input.tags ?? []),
    });

    const product = await getProductDetailHelper(result.insertId);

    // Invalidate cache
    await cacheInvalidatePattern("products:*");

    log.info({ productId: Number(result.insertId), name: input.name }, "Product created");
    return product;
  },

  /**
   * Admin: Update product.
   */
  async update(id: number, input: UpdateProductInput) {
    const existing = await db.select("products", "id, slug", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Product");

    // If name changed, update slug
    let slug: string | undefined;
    if (input.name) {
      slug = slugify(input.name);
      const slugExists = await db.select("products", "id", "slug = ? AND id != ?", [slug, id]);
      if (slugExists) slug = uniqueSlug(input.name);
    }

    await db.update(
      "products",
      {
        ...(input.name && { name: input.name }),
        ...(slug && { slug }),
        ...(input.sku && { sku: input.sku }),
        ...(input.shortDescription !== undefined && { short_description: input.shortDescription }),
        ...(input.longDescription !== undefined && { long_description: input.longDescription }),
        ...(input.material !== undefined && { material: input.material }),
        ...(input.dimensions !== undefined && { dimensions: input.dimensions }),
        ...(input.weight !== undefined && { weight: input.weight }),
        ...(input.careInstructions && { care_instructions: JSON.stringify(input.careInstructions) }),
        ...(input.features && { features: JSON.stringify(input.features) }),
        ...(input.categoryId && { category_id: BigInt(input.categoryId) }),
        ...(input.brandId !== undefined && { brand_id: input.brandId ? BigInt(input.brandId) : null }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.salePrice !== undefined && { sale_price: input.salePrice }),
        ...(input.isFeatured !== undefined && { is_featured: input.isFeatured }),
        ...(input.isTrending !== undefined && { is_trending: input.isTrending }),
        ...(input.featuredRank !== undefined && { featured_rank: input.featuredRank }),
        ...(input.stockCount !== undefined && {
          stock_count: input.stockCount,
          in_stock: input.stockCount > 0,
        }),
        ...(input.seoTitle !== undefined && { seo_title: input.seoTitle }),
        ...(input.seoDescription !== undefined && { seo_description: input.seoDescription }),
        ...(input.tags !== undefined && { tags: JSON.stringify(input.tags) }),
      },
      "id = ?",
      [id],
    );

    const product = await getProductDetailHelper(id);

    // Invalidate cache
    await cacheInvalidatePattern("products:*");
    await cacheInvalidatePattern(`product:${existing.slug}`);

    log.info({ productId: id }, "Product updated");
    return product;
  },

  /**
   * Admin: Soft-delete product.
   */
  async delete(id: number) {
    const product = await db.select("products", "slug", "id = ? AND deleted_at IS NULL", [id]);
    if (!product) throw AppError.notFound("Product");

    await db.update(
      "products",
      {
        deleted_at: new Date(),
      },
      "id = ?",
      [id],
    );

    await cacheInvalidatePattern("products:*");
    await cacheInvalidatePattern(`product:${product.slug}`);

    log.info({ productId: id }, "Product soft-deleted");
  },

  async addImage(productId: number, input: { url: string; isPrimary?: boolean; position?: number }) {
    const product = await db.select("products", "id, slug", "id = ? AND deleted_at IS NULL", [productId]);
    if (!product) throw AppError.notFound("Product");
    if (input.isPrimary) {
      await db.update("product_images", { is_primary: 0 }, "product_id = ?", [productId]);
    }
    const result = await db.insert("product_images", {
      product_id: BigInt(productId),
      url: input.url,
      is_primary: input.isPrimary ? 1 : 0,
      position: input.position ?? 0,
    });
    await cacheInvalidatePattern("products:*");
    const img = await db.select("product_images", "*", "id = ?", [result.insertId]);
    return {
      id: Number(img!.id),
      url: img!.url,
      isPrimary: Boolean(img!.is_primary),
      position: Number(img!.position),
    };
  },

  async removeImage(productId: number, imageId: number) {
    const img = await db.select("product_images", "id", "id = ? AND product_id = ?", [imageId, productId]);
    if (!img) throw AppError.notFound("Image");
    await db.delete("product_images", "id = ?", [imageId]);
    await cacheInvalidatePattern("products:*");
  },

  async addVariant(
    productId: number,
    input: { sku: string; color?: string; size?: string; packSize?: string; priceDelta?: number; stockCount?: number },
  ) {
    const product = await db.select("products", "id", "id = ? AND deleted_at IS NULL", [productId]);
    if (!product) throw AppError.notFound("Product");
    const result = await db.insert("product_variants", {
      product_id: BigInt(productId),
      sku: input.sku,
      color: input.color ?? null,
      size: input.size ?? null,
      pack_size: input.packSize ?? null,
      price_delta: input.priceDelta ?? 0,
      stock_count: input.stockCount ?? 0,
    });
    const v = await db.select("product_variants", "*", "id = ?", [result.insertId]);
    return {
      id: Number(v!.id),
      sku: v!.sku,
      color: v!.color,
      size: v!.size,
      packSize: v!.pack_size,
      priceDelta: Number(v!.price_delta),
      stockCount: Number(v!.stock_count),
    };
  },

  async removeVariant(productId: number, variantId: number) {
    const v = await db.select("product_variants", "id", "id = ? AND product_id = ?", [variantId, productId]);
    if (!v) throw AppError.notFound("Variant");
    await db.delete("product_variants", "id = ?", [variantId]);
  },
};
