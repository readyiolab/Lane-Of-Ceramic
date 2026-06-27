import { db } from "../../database/mysql.js";
import { AppError } from "../../common/api-error.js";
import { cacheInvalidatePattern } from "../../database/redis.js";
import { createModuleLogger } from "../../utils/logger.js";
import { parsePagination } from "../../utils/pagination.js";

const log = createModuleLogger("review-service");

export const reviewService = {
  /**
   * Submit a product review.
   */
  async submitReview(
    userId: string,
    input: {
      productId: number;
      rating: number;
      title?: string | null;
      comment?: string | null;
    },
  ) {
    // 1. Verify product exists
    const product = await db.select("products", "id", "id = ? AND deleted_at IS NULL", [BigInt(input.productId)]);
    if (!product) throw AppError.notFound("Product");

    // 2. Check if user already reviewed
    const existing = await db.select("reviews", "id", "user_id = ? AND product_id = ?", [userId, BigInt(input.productId)]);
    if (existing) {
      throw AppError.badRequest("You have already reviewed this product");
    }

    // 3. Determine if verified purchase (User ordered product and order status is DELIVERED)
    const orderItem = await db.query(
      `SELECT oi.id
       FROM ec_order_items oi
       JOIN ec_orders o ON oi.order_id = o.id
       WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'DELIVERED'
       LIMIT 1`,
      [BigInt(input.productId), userId]
    );

    const isVerifiedPurchase = !!orderItem;

    // For better UX, we auto-approve reviews in staging/development
    const isApproved = 1; // Auto-approve for simplicity

    const insertRes = await db.insert("reviews", {
      product_id: BigInt(input.productId),
      user_id: userId,
      rating: input.rating,
      title: input.title || null,
      comment: input.comment || null,
      is_verified_purchase: isVerifiedPurchase ? 1 : 0,
      is_approved: isApproved,
    });

    // 4. Update product rating/count since we auto-approved
    if (isApproved) {
      await this.recalculateProductRating(input.productId);
    }

    log.info({ reviewId: insertRes.insertId }, "Review submitted successfully");

    return {
      id: insertRes.insertId,
      rating: input.rating,
      title: input.title || null,
      comment: input.comment || null,
      isVerifiedPurchase,
      isApproved: true,
    };
  },

  /**
   * Recalculate average rating and total review counts for a product.
   */
  async recalculateProductRating(productId: number) {
    const result = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(rating) as rating_count
       FROM ec_reviews
       WHERE product_id = ? AND is_approved = 1`,
      [BigInt(productId)]
    );

    const avgRating = result?.avg_rating ? Number(result.avg_rating) : 0;
    const count = result?.rating_count ? Number(result.rating_count) : 0;

    await db.update("products", {
      rating: avgRating,
      review_count: count,
    }, "id = ?", [BigInt(productId)]);

    // Clear product cache
    const product = await db.select("products", "slug", "id = ?", [BigInt(productId)]);

    if (product) {
      await cacheInvalidatePattern(`product:${product.slug}`);
      await cacheInvalidatePattern("products:*");
    }

    log.info({ productId, avgRating, count }, "Product rating recalculated");
  },

  /**
   * List reviews for a product by slug.
   */
  async listForProduct(slug: string, query: { page?: number; limit?: number }) {
    const { page, limit, skip } = parsePagination(query as Record<string, unknown>);

    const product = await db.select("products", "id", "slug = ? AND deleted_at IS NULL", [slug]);
    if (!product) throw AppError.notFound("Product");

    const total = await db.count("reviews", "product_id = ? AND is_approved = 1", [BigInt(product.id)]);

    const data = await db.queryAll(
      `SELECT r.*, u.fullName
       FROM ec_reviews r
       JOIN ec_users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_approved = 1
       ORDER BY r.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(skip)}`,
      [BigInt(product.id)]
    );

    const reviews = data.map((r) => ({
      id: Number(r.id),
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: Boolean(r.is_verified_purchase),
      createdAt: r.created_at,
      customerName: r.fullName,
    }));

    return { data: reviews, total, page, limit };
  },

  /**
   * Admin: List all pending/approved reviews.
   */
  async listAll(page = 1, limit = 20, isApproved?: boolean) {
    const skip = (page - 1) * limit;

    let whereSQL = "1=1";
    const params: any[] = [];
    if (isApproved !== undefined) {
      whereSQL += " AND r.is_approved = ?";
      params.push(isApproved ? 1 : 0);
    }

    const countParams = isApproved !== undefined ? [isApproved ? 1 : 0] : [];
    const total = await db.count("reviews", whereSQL.replace(/r\./g, ""), countParams);

    const queryParams = [...params, limit, skip];
    const data = await db.queryAll(
      `SELECT r.*, u.fullName, u.email, p.name as product_name, p.slug as product_slug
       FROM ec_reviews r
       JOIN ec_users u ON r.user_id = u.id
       JOIN ec_products p ON r.product_id = p.id
       WHERE ${whereSQL}
       ORDER BY r.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(skip)}`,
      params
    );

    const reviews = data.map((r) => ({
      id: Number(r.id),
      productId: Number(r.product_id),
      userId: r.user_id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: Boolean(r.is_verified_purchase),
      isApproved: Boolean(r.is_approved),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      customerName: r.fullName,
      customerEmail: r.email,
      productName: r.product_name,
      productSlug: r.product_slug,
    }));

    return { data: reviews, total, page, limit };
  },

  /**
   * Admin: Approve a review.
   */
  async approveReview(id: number) {
    const review = await db.select("reviews", "*", "id = ?", [BigInt(id)]);
    if (!review) throw AppError.notFound("Review");

    await db.update("reviews", { is_approved: 1 }, "id = ?", [BigInt(id)]);

    await this.recalculateProductRating(Number(review.product_id));
    log.info({ reviewId: id }, "Review approved");
  },

  /**
   * Admin: Delete a review.
   */
  async deleteReview(id: number) {
    const review = await db.select("reviews", "*", "id = ?", [BigInt(id)]);
    if (!review) throw AppError.notFound("Review");

    await db.delete("reviews", "id = ?", [BigInt(id)]);

    if (review.is_approved) {
      await this.recalculateProductRating(Number(review.product_id));
    }

    log.info({ reviewId: id }, "Review deleted");
  },
};
