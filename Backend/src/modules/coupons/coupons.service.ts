import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { createModuleLogger } from "../../utils/logger.js";

const log = createModuleLogger("coupon-service");

function mapCoupon(row: any) {
  if (!row) return null;
  return {
    id: Number(row.id),
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderValue: row.min_order_value ? Number(row.min_order_value) : null,
    maxDiscount: row.max_discount ? Number(row.max_discount) : null,
    usageLimit: row.usage_limit !== null ? Number(row.usage_limit) : null,
    usedCount: Number(row.used_count ?? 0),
    isFirstOrderOnly: Boolean(row.is_first_order_only),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: Boolean(row.isActive),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const couponService = {
  /**
   * Validate a coupon code for checkout.
   */
  async checkCoupon(code: string, subtotal: number) {
    const coupon = await db.select("coupons", "*", "code = ? AND isActive = ?", [code.toUpperCase(), true]);

    if (!coupon) {
      throw AppError.notFound("Coupon code is invalid");
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      throw AppError.badRequest("Coupon is not active yet");
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      throw AppError.badRequest("Coupon has expired");
    }

    if (coupon.usage_limit !== null && Number(coupon.used_count) >= Number(coupon.usage_limit)) {
      throw AppError.badRequest("Coupon usage limit exceeded");
    }

    if (coupon.min_order_value !== null && subtotal < Number(coupon.min_order_value)) {
      throw AppError.badRequest(
        `Minimum purchase of INR ${coupon.min_order_value} required for this coupon`,
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount !== null) {
        discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
      }
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    return {
      couponId: Number(coupon.id),
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discountAmount,
    };
  },

  // ── Admin CRUD ──────────────────────────────────────────────

  async listAll() {
    const data = await db.selectAll("coupons", "*", "", [], "ORDER BY created_at DESC");
    return data.map(mapCoupon);
  },

  async getById(id: number) {
    const coupon = await db.select("coupons", "*", "id = ?", [id]);
    if (!coupon) throw AppError.notFound("Coupon");
    return mapCoupon(coupon);
  },

  async create(input: any) {
    const codeUpper = input.code.toUpperCase();
    const existing = await db.select("coupons", "id", "code = ?", [codeUpper]);
    if (existing) throw AppError.conflict("Coupon code already exists");

    const result = await db.insert("coupons", {
      code: codeUpper,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      min_order_value: input.minOrderValue ?? null,
      max_discount: input.maxDiscount ?? null,
      usage_limit: input.usageLimit ?? null,
      used_count: input.usedCount ?? 0,
      is_first_order_only: input.isFirstOrderOnly ?? false,
      starts_at: input.startsAt ? new Date(input.startsAt) : null,
      expires_at: input.expiresAt ? new Date(input.expiresAt) : null,
      isActive: input.isActive ?? true,
    });

    const coupon = await db.select("coupons", "*", "id = ?", [result.insertId]);
    log.info({ couponId: Number(result.insertId) }, "Coupon created");
    return mapCoupon(coupon);
  },

  async update(id: number, input: any) {
    const coupon = await db.select("coupons", "id", "id = ?", [id]);
    if (!coupon) throw AppError.notFound("Coupon");

    let codeUpper = input.code ? input.code.toUpperCase() : undefined;
    if (codeUpper) {
      const codeExists = await db.select("coupons", "id", "code = ? AND id != ?", [codeUpper, id]);
      if (codeExists) throw AppError.conflict("Coupon code already exists");
    }

    await db.update(
      "coupons",
      {
        ...(codeUpper && { code: codeUpper }),
        ...(input.discountType && { discount_type: input.discountType }),
        ...(input.discountValue !== undefined && { discount_value: input.discountValue }),
        ...(input.minOrderValue !== undefined && { min_order_value: input.minOrderValue }),
        ...(input.maxDiscount !== undefined && { max_discount: input.maxDiscount }),
        ...(input.usageLimit !== undefined && { usage_limit: input.usageLimit }),
        ...(input.usedCount !== undefined && { used_count: input.usedCount }),
        ...(input.isFirstOrderOnly !== undefined && { is_first_order_only: input.isFirstOrderOnly }),
        ...(input.startsAt !== undefined && { starts_at: input.startsAt ? new Date(input.startsAt) : null }),
        ...(input.expiresAt !== undefined && { expires_at: input.expiresAt ? new Date(input.expiresAt) : null }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      "id = ?",
      [id],
    );

    const updated = await db.select("coupons", "*", "id = ?", [id]);
    log.info({ couponId: id }, "Coupon updated");
    return mapCoupon(updated);
  },

  async delete(id: number) {
    const coupon = await db.select("coupons", "id", "id = ?", [id]);
    if (!coupon) throw AppError.notFound("Coupon");

    await db.delete("coupons", "id = ?", [id]);
    log.info({ couponId: id }, "Coupon deleted");
  },
};
