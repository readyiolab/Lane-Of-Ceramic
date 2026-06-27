import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { createModuleLogger } from "../../utils/logger.js";

const log = createModuleLogger("wishlist-service");

export const wishlistService = {
  /**
   * Get all wishlist items for a user.
   */
  async list(userId: string) {
    const rows = await db.queryAll(`
      SELECT w.id as wishlistId, w.product_id as productId, w.created_at as addedAt,
             p.name, p.slug, p.price, p.sale_price as salePrice, p.in_stock as inStock,
             pi.url as imageUrl
      FROM ec_wishlist w
      JOIN ec_products p ON w.product_id = p.id AND p.deleted_at IS NULL
      LEFT JOIN ec_product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);

    return rows.map((r) => ({
      wishlistId: Number(r.wishlistId),
      productId: Number(r.productId),
      addedAt: r.addedAt,
      name: r.name,
      slug: r.slug,
      price: Number(r.price),
      salePrice: r.salePrice ? Number(r.salePrice) : null,
      inStock: Boolean(r.inStock),
      image: r.imageUrl ?? null,
    }));
  },

  /**
   * Toggle a product in wishlist (Add if not present, delete if present).
   */
  async toggle(userId: string, productId: number) {
    // 1. Verify product exists and is active
    const product = await db.select("products", "id", "id = ? AND deleted_at IS NULL", [productId]);
    if (!product) throw AppError.notFound("Product");

    // 2. Check if already exists
    const existing = await db.select("wishlist", "id", "user_id = ? AND product_id = ?", [userId, productId]);

    if (existing) {
      // Remove
      await db.delete("wishlist", "id = ?", [existing.id]);
      log.info({ userId, productId }, "Product removed from wishlist");
      return { added: false, message: "Removed from wishlist" };
    } else {
      // Add
      await db.insert("wishlist", {
        user_id: userId,
        product_id: BigInt(productId),
      });
      log.info({ userId, productId }, "Product added to wishlist");
      return { added: true, message: "Added to wishlist" };
    }
  },
};
