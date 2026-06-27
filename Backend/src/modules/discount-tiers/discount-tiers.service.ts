import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { DISCOUNT_TIERS } from "../../config/constants.js";

function mapTier(row: any) {
  return {
    id: Number(row.id),
    threshold: Number(row.threshold),
    label: row.label,
    icon: row.icon,
    discountPct: Number(row.discount_pct),
    shipping: Number(row.shipping),
    sortOrder: Number(row.sort_order),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const discountTierService = {
  async listActive() {
    try {
      const rows = await db.selectAll(
        "discount_tiers",
        "*",
        "is_active = 1",
        [],
        "ORDER BY sort_order ASC, threshold ASC",
      );
      if (rows.length > 0) return rows.map(mapTier);
    } catch {
      // table may not exist yet
    }
    return DISCOUNT_TIERS.map((t, i) => ({
      id: i + 1,
      threshold: t.threshold,
      label: t.label,
      icon: null,
      discountPct: t.discountPct,
      shipping: t.shipping,
      sortOrder: i,
      isActive: true,
    }));
  },

  async listAll() {
    const rows = await db.selectAll("discount_tiers", "*", "1=1", [], "ORDER BY sort_order ASC");
    return rows.map(mapTier);
  },

  async getById(id: number) {
    const row = await db.select("discount_tiers", "*", "id = ?", [id]);
    if (!row) throw AppError.notFound("Discount tier");
    return mapTier(row);
  },

  async create(input: {
    threshold: number;
    label: string;
    icon?: string | null;
    discountPct?: number;
    shipping?: number;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const result = await db.insert("discount_tiers", {
      threshold: input.threshold,
      label: input.label,
      icon: input.icon ?? null,
      discount_pct: input.discountPct ?? 0,
      shipping: input.shipping ?? 0,
      sort_order: input.sortOrder ?? 0,
      is_active: input.isActive !== false ? 1 : 0,
    });
    return this.getById(Number(result.insertId));
  },

  async update(id: number, input: Partial<{
    threshold: number;
    label: string;
    icon: string | null;
    discountPct: number;
    shipping: number;
    sortOrder: number;
    isActive: boolean;
  }>) {
    const existing = await db.select("discount_tiers", "id", "id = ?", [id]);
    if (!existing) throw AppError.notFound("Discount tier");
    await db.update(
      "discount_tiers",
      {
        ...(input.threshold !== undefined && { threshold: input.threshold }),
        ...(input.label && { label: input.label }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.discountPct !== undefined && { discount_pct: input.discountPct }),
        ...(input.shipping !== undefined && { shipping: input.shipping }),
        ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        ...(input.isActive !== undefined && { is_active: input.isActive ? 1 : 0 }),
      },
      "id = ?",
      [id],
    );
    return this.getById(id);
  },

  async remove(id: number) {
    const existing = await db.select("discount_tiers", "id", "id = ?", [id]);
    if (!existing) throw AppError.notFound("Discount tier");
    await db.delete("discount_tiers", "id = ?", [id]);
  },
};
