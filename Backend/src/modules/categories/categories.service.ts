import { db } from "../../database/mysql.js";
import { cacheGet, cacheSet, cacheInvalidatePattern } from "../../database/redis.js";
import { AppError } from "../../common/api-error.js";
import { slugify, uniqueSlug } from "../../utils/slug.js";
import { CACHE_TTL, CACHE_KEY } from "../../config/constants.js";
import { createModuleLogger } from "../../utils/logger.js";
import { productService } from "../products/products.service.js";

const log = createModuleLogger("category-service");

function mapCategory(row: any) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id ? Number(row.parent_id) : null,
    description: row.description,
    image: row.image,
    subtitle: row.subtitle ?? null,
    heroImage: row.hero_image ?? null,
    heroTitle: row.hero_title ?? null,
    sortOrder: Number(row.sort_order ?? row.display_order ?? 0),
    displayOrder: Number(row.display_order ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export const categoryService = {
  /**
   * List all categories, optionally cached.
   */
  async listAll() {
    const cached = await cacheGet(CACHE_KEY.CATEGORIES_ALL);
    if (cached) return cached;

    const sql = `
      SELECT c.id, c.name, c.slug, c.parent_id, c.description, c.image, c.display_order,
             (SELECT COUNT(*) FROM ec_products p WHERE p.category_id = c.id AND p.deleted_at IS NULL) as productCount
      FROM ec_categories c
      WHERE c.deleted_at IS NULL
      ORDER BY c.display_order ASC
    `;
    const categories = await db.queryAll(sql);

    const result = categories.map((c) => ({
      id: Number(c.id),
      name: c.name,
      slug: c.slug,
      parentId: c.parent_id ? Number(c.parent_id) : null,
      description: c.description,
      image: c.image,
      displayOrder: Number(c.display_order ?? 0),
      productCount: Number(c.productCount),
    }));

    await cacheSet(CACHE_KEY.CATEGORIES_ALL, result, CACHE_TTL.CATEGORIES);
    return result;
  },

  /**
   * Get nested category tree.
   */
  async getTree() {
    const list = await this.listAll();
    const map = new Map<number, any>();
    const roots: any[] = [];

    // Initialize map
    for (const item of list as any[]) {
      map.set(item.id, { ...item, children: [] });
    }

    // Build tree
    for (const item of list as any[]) {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  },

  async getBySlug(slug: string) {
    const category = await db.select("categories", "*", "slug = ? AND deleted_at IS NULL", [slug]);
    if (!category) throw AppError.notFound("Category");
    return mapCategory(category);
  },

  async getPageBySlug(slug: string, query: { page?: number; limit?: number }) {
    const category = await this.getBySlug(slug);
    const products = await productService.list({
      category: slug,
      page: query.page ?? 1,
      limit: query.limit ?? 24,
    });
    return { category, products: products.data, meta: { total: products.total, page: products.page, limit: products.limit } };
  },

  /**
   * Get category by slug or id.
   */
  async getById(id: number) {
    const category = await db.select("categories", "*", "id = ? AND deleted_at IS NULL", [id]);
    if (!category) throw AppError.notFound("Category");
    return mapCategory(category);
  },

  /**
   * Admin: Create category.
   */
  async create(input: {
    name: string;
    parentId?: number | null;
    description?: string | null;
    image?: string | null;
    displayOrder?: number;
    subtitle?: string | null;
    heroImage?: string | null;
    heroTitle?: string | null;
    sortOrder?: number;
  }) {
    let slug = slugify(input.name);
    const slugExists = await db.select("categories", "id", "slug = ? AND deleted_at IS NULL", [slug]);
    if (slugExists) slug = uniqueSlug(input.name);

    if (input.parentId) {
      const parentExists = await db.select("categories", "id", "id = ? AND deleted_at IS NULL", [input.parentId]);
      if (!parentExists) throw AppError.badRequest("Parent category does not exist");
    }

    const result = await db.insert("categories", {
      name: input.name,
      slug,
      parent_id: input.parentId ? BigInt(input.parentId) : null,
      description: input.description ?? null,
      image: input.image ?? null,
      display_order: input.displayOrder ?? 0,
      subtitle: input.subtitle ?? null,
      hero_image: input.heroImage ?? null,
      hero_title: input.heroTitle ?? null,
      sort_order: input.sortOrder ?? input.displayOrder ?? 0,
    });

    const category = await db.select("categories", "*", "id = ?", [result.insertId]);

    await cacheInvalidatePattern("categories:*");
    log.info({ categoryId: Number(result.insertId), name: input.name }, "Category created");

    return mapCategory(category);
  },

  /**
   * Admin: Update category.
   */
  async update(
    id: number,
    input: {
      name?: string;
      parentId?: number | null;
      description?: string | null;
      image?: string | null;
      displayOrder?: number;
      subtitle?: string | null;
      heroImage?: string | null;
      heroTitle?: string | null;
      sortOrder?: number;
    },
  ) {
    const existing = await db.select("categories", "*", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Category");

    let slug: string | undefined;
    if (input.name) {
      slug = slugify(input.name);
      const slugExists = await db.select("categories", "id", "slug = ? AND id != ? AND deleted_at IS NULL", [slug, id]);
      if (slugExists) slug = uniqueSlug(input.name);
    }

    if (input.parentId) {
      if (input.parentId === id) throw AppError.badRequest("A category cannot be its own parent");
      const parentExists = await db.select("categories", "id", "id = ? AND deleted_at IS NULL", [input.parentId]);
      if (!parentExists) throw AppError.badRequest("Parent category does not exist");
    }

    await db.update(
      "categories",
      {
        ...(input.name && { name: input.name, slug }),
        ...(input.parentId !== undefined && { parent_id: input.parentId ? BigInt(input.parentId) : null }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.image !== undefined && { image: input.image }),
        ...(input.displayOrder !== undefined && { display_order: input.displayOrder }),
        ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
        ...(input.heroImage !== undefined && { hero_image: input.heroImage }),
        ...(input.heroTitle !== undefined && { hero_title: input.heroTitle }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
      },
      "id = ?",
      [id],
    );

    const updated = await db.select("categories", "*", "id = ?", [id]);

    await cacheInvalidatePattern("categories:*");
    await cacheInvalidatePattern("products:*"); // product details contain category info
    log.info({ categoryId: id }, "Category updated");

    return mapCategory(updated);
  },

  /**
   * Admin: Soft delete category.
   */
  async delete(id: number) {
    const existing = await db.select("categories", "id", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Category");

    // Check if children exist
    const hasChildren = await db.select("categories", "id", "parent_id = ? AND deleted_at IS NULL", [id]);
    if (hasChildren) {
      throw AppError.badRequest("Cannot delete category with active subcategories");
    }

    // Check if products exist in category
    const hasProducts = await db.select("products", "id", "category_id = ? AND deleted_at IS NULL", [id]);
    if (hasProducts) {
      throw AppError.badRequest("Cannot delete category containing active products");
    }

    await db.update("categories", { deleted_at: new Date() }, "id = ?", [id]);

    await cacheInvalidatePattern("categories:*");
    await cacheInvalidatePattern("products:*");
    log.info({ categoryId: id }, "Category deleted");
  },
};
