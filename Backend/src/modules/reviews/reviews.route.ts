import { Router } from "express";
import { reviewController } from "./reviews.controller.js";
import { validateBody, validateQuery, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  createReviewSchema,
  listProductReviewsQuerySchema,
  reviewIdParamSchema,
  productSlugParamSchemaForReviews,
} from "./reviews.validator.js";

export const reviewsRouter = Router();

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Submit a product review (secured)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Review submitted }
 */
reviewsRouter.post(
  "/",
  authGuard,
  validateBody(createReviewSchema),
  reviewController.submit,
);

/**
 * @swagger
 * /reviews/product/{slug}:
 *   get:
 *     tags: [Reviews]
 *     summary: List approved reviews for a product by slug
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Paginated list of reviews }
 */
reviewsRouter.get(
  "/product/:slug",
  validateParams(productSlugParamSchemaForReviews),
  validateQuery(listProductReviewsQuerySchema),
  reviewController.listForProduct,
);

// ── Admin Routes ──────────────────────────────────────────────

/**
 * @swagger
 * /reviews/admin:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for moderation (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated reviews }
 */
reviewsRouter.get(
  "/admin/list",
  authGuard,
  requireAdmin,
  reviewController.adminList,
);

/**
 * @swagger
 * /reviews/admin/{id}/approve:
 *   patch:
 *     tags: [Reviews]
 *     summary: Approve a review (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Review approved }
 */
reviewsRouter.patch(
  "/admin/:id/approve",
  authGuard,
  requireAdmin,
  validateParams(reviewIdParamSchema),
  reviewController.adminApprove,
);

/**
 * @swagger
 * /reviews/admin/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Review deleted }
 */
reviewsRouter.delete(
  "/admin/:id",
  authGuard,
  requireAdmin,
  validateParams(reviewIdParamSchema),
  reviewController.adminRemove,
);
