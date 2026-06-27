import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { slugify } from "../../utils/slug.js";

function mapBundle(row: any) {
  return {
    id: Number(row.id),
    slug: row.slug,
    label: row.label,
    tagline: row.tagline,
    itemCount: Number(row.item_count),
    price: Number(row.price),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const bundleService = {
  async listActive() {
    const rows = await db.selectAll(
      "bundle_offers",
      "*",
      "is_active = 1 AND deleted_at IS NULL",
      [],
      "ORDER BY item_count ASC",
    );
    return rows.map(mapBundle);
  },

  async listAll() {
    const rows = await db.selectAll(
      "bundle_offers",
      "*",
      "deleted_at IS NULL",
      [],
      "ORDER BY item_count ASC",
    );
    return rows.map(mapBundle);
  },

  async getById(id: number) {
    const row = await db.select("bundle_offers", "*", "id = ? AND deleted_at IS NULL", [id]);
    if (!row) throw AppError.notFound("Bundle");
    return mapBundle(row);
  },

  async create(input: {
    slug?: string;
    label: string;
    tagline?: string | null;
    itemCount: number;
    price: number;
    isActive?: boolean;
  }) {
    const slug = input.slug ?? slugify(input.label);
    const result = await db.insert("bundle_offers", {
      slug,
      label: input.label,
      tagline: input.tagline ?? null,
      item_count: input.itemCount,
      price: input.price,
      is_active: input.isActive !== false ? 1 : 0,
    });
    const row = await db.select("bundle_offers", "*", "id = ?", [result.insertId]);
    return mapBundle(row);
  },

  async update(
    id: number,
    input: Partial<{
      slug: string;
      label: string;
      tagline: string | null;
      itemCount: number;
      price: number;
      isActive: boolean;
    }>,
  ) {
    const existing = await db.select("bundle_offers", "id", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Bundle");
    await db.update(
      "bundle_offers",
      {
        ...(input.slug && { slug: input.slug }),
        ...(input.label && { label: input.label }),
        ...(input.tagline !== undefined && { tagline: input.tagline }),
        ...(input.itemCount !== undefined && { item_count: input.itemCount }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.isActive !== undefined && { is_active: input.isActive ? 1 : 0 }),
      },
      "id = ?",
      [id],
    );
    return this.getById(id);
  },

  async remove(id: number) {
    const existing = await db.select("bundle_offers", "id", "id = ? AND deleted_at IS NULL", [id]);
    if (!existing) throw AppError.notFound("Bundle");
    await db.update("bundle_offers", { deleted_at: new Date() }, "id = ?", [id]);
  },
};
