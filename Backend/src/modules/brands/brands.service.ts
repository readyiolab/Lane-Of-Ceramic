import { db } from "../../database/mysql.js";
import { cacheGet, cacheSet, cacheClearCatalog } from "../../database/redis.js";
import { AppError } from "../../common/api-error.js";
import { slugify, uniqueSlug } from "../../utils/slug.js";
import { CACHE_TTL, CACHE_KEY } from "../../config/constants.js";
import { createModuleLogger } from "../../utils/logger.js";

const log = createModuleLogger("brand-service");

function mapBrand(row: any) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export const brandService = {
  /**
   * List all brands, optionally cached.
   */
  async listAll() {
    const cached = await cacheGet(CACHE_KEY.BRANDS_ALL);
    if (cached) return cached;

    const sql = `
      SELECT b.id, b.name, b.slug,
             (SELECT COUNT(*) FROM ec_products p WHERE p.brand_id = b.id AND p.deleted_at IS NULL) as productCount
      FROM ec_brands b
      WHERE b.deleted_at IS NULL
      ORDER BY b.name ASC
    `;
    const brands = await db.queryAll(sql);

    const result = brands.map((b) => ({
      id: Number(b.id),
      name: b.name,
      slug: b.slug,
      productCount: Number(b.productCount),
    }));

    await cacheSet(CACHE_KEY.BRANDS_ALL, result, CACHE_TTL.BRANDS);
    return result;
  },

  /**
   * Get brand by id.
   */
  async getById(id: number) {
    const brand = await db.select("brands", "*", "id = ? AND deleted_at IS NULL", [id]);
    if (!brand) throw AppError.notFound("Brand");
    return mapBrand(brand);
  },

  /**
   * Admin: Create brand.
   */
  async create(input: {
    name: string;
    description?: string | null;
    logo?: string | null;
  }) {
    let slug = slugify(input.name);
    const slugExists = await db.select("brands", "id", "slug = ? AND deleted_at IS NULL", [slug]);
    if (slugExists) slug = uniqueSlug(input.name);

    const result = await db.insert("brands", {
      name: input.name,
      slug,
    });

    const brand = await db.select("brands", "*", "id = ?", [result.insertId]);

    await cacheClearCatalog();
    log.info({ brandId: Number(result.insertId), name: input.name }, "Brand created");

    return mapBrand(brand);
  },

  /**
   * Admin: Update brand.
   */
  async update(
    id: number,
    input: {
      name?: string;
      description?: string | null;
      logo?: string | null;
    },
  ) {
    const existing = await db.select("brands", "*", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Brand");

    let slug: string | undefined;
    if (input.name) {
      slug = slugify(input.name);
      const slugExists = await db.select("brands", "id", "slug = ? AND id != ? AND deleted_at IS NULL", [slug, id]);
      if (slugExists) slug = uniqueSlug(input.name);
    }

    await db.update(
      "brands",
      {
        ...(input.name && { name: input.name, slug }),
      },
      "id = ?",
      [id],
    );

    const updated = await db.select("brands", "*", "id = ?", [id]);

    await cacheClearCatalog();
    log.info({ brandId: id }, "Brand updated");

    return mapBrand(updated);
  },

  /**
   * Admin: Soft delete brand.
   */
  async delete(id: number) {
    const existing = await db.select("brands", "id", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Brand");

    // Check if products exist in brand
    const hasProducts = await db.select("products", "id", "brand_id = ? AND deleted_at IS NULL", [id]);
    if (hasProducts) {
      throw AppError.badRequest("Cannot delete brand containing active products");
    }

    await db.update("brands", { deleted_at: new Date() }, "id = ?", [id]);

    await cacheClearCatalog();
    log.info({ brandId: id }, "Brand deleted");
  },
};
