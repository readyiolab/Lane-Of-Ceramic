import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { parsePagination } from "../../utils/pagination.js";

export const inventoryService = {
  async adjustStock(
    productId: number,
    quantity: number,
    reason: string,
    variantId?: number | null,
  ) {
    const product = await db.select("products", "*", "id = ? AND deleted_at IS NULL", [productId]);
    if (!product) throw AppError.notFound("Product");

    if (variantId) {
      const variant = await db.select("product_variants", "*", "id = ? AND product_id = ?", [
        variantId,
        productId,
      ]);
      if (!variant) throw AppError.notFound("Variant");
      const newStock = variant.stock_count + quantity;
      if (newStock < 0) throw AppError.badRequest("Insufficient stock for adjustment");
      await db.update("product_variants", { stock_count: newStock }, "id = ?", [variantId]);
    }

    const newStock = product.stock_count + quantity;
    if (newStock < 0) throw AppError.badRequest("Insufficient stock for adjustment");
    await db.update(
      "products",
      { stock_count: newStock, in_stock: newStock > 0 ? 1 : 0 },
      "id = ?",
      [productId],
    );

    await db.insert("inventory_logs", {
      product_id: BigInt(productId),
      variant_id: variantId ? BigInt(variantId) : null,
      change_type: quantity >= 0 ? "MANUAL_INCREMENT" : "MANUAL_DECREMENT",
      quantity,
      reason,
    });

    return { productId, newStock: newStock + (variantId ? 0 : 0), variantId: variantId ?? null };
  },

  async listLogs(query: { page?: number; limit?: number; productId?: number }) {
    const { page, limit, skip } = parsePagination(query as Record<string, unknown>);
    let where = "1=1";
    const params: unknown[] = [];
    if (query.productId) {
      where += " AND il.product_id = ?";
      params.push(query.productId);
    }
    const rows = await db.queryAll(
      `SELECT il.*, p.name as product_name
       FROM ec_inventory_logs il
       JOIN ec_products p ON il.product_id = p.id
       WHERE ${where}
       ORDER BY il.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(skip)}`,
      params,
    );
    const count = await db.query(
      `SELECT COUNT(*) as total FROM ec_inventory_logs il WHERE ${where}`,
      params,
    );
    return {
      data: rows.map((r) => ({
        id: Number(r.id),
        productId: Number(r.product_id),
        productName: r.product_name,
        variantId: r.variant_id ? Number(r.variant_id) : null,
        changeType: r.change_type,
        quantity: r.quantity,
        reason: r.reason,
        createdAt: r.created_at,
      })),
      total: Number(count?.total ?? 0),
      page,
      limit,
    };
  },
};
