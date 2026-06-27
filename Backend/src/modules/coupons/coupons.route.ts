import { Router } from "express";
import { couponController } from "./coupons.controller.js";
import { validateBody, validateQuery, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
  couponIdParamSchema,
  checkCouponQuerySchema,
} from "./coupons.validator.js";

export const couponsRouter = Router();

/**
 * @swagger
 * /coupons/validate:
 *   get:
 *     tags: [Coupons]
 *     summary: Validate coupon code for checkout
 *     parameters:
 *       - name: code
 *         in: query
 *         required: true
 *       - name: subtotal
 *         in: query
 *         required: true
 *     responses:
 *       200: { description: Coupon discount amounts }
 */
couponsRouter.get("/validate", validateQuery(checkCouponQuerySchema), couponController.validate);

// ── Admin Routes ──────────────────────────────────────────────
couponsRouter.use(authGuard, requireAdmin);

/**
 * @swagger
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: Get all coupons (admin)
 *     security: [{ bearerAuth: [] }]
 */
couponsRouter.get("/", couponController.list);

/**
 * @swagger
 * /coupons/{id}:
 *   get:
 *     tags: [Coupons]
 *     summary: Get coupon details by ID (admin)
 *     security: [{ bearerAuth: [] }]
 */
couponsRouter.get("/:id", validateParams(couponIdParamSchema), couponController.getById);

/**
 * @swagger
 * /coupons:
 *   post:
 *     tags: [Coupons]
 *     summary: Create new promo coupon (admin)
 *     security: [{ bearerAuth: [] }]
 */
couponsRouter.post("/", validateBody(createCouponSchema), couponController.create);

/**
 * @swagger
 * /coupons/{id}:
 *   patch:
 *     tags: [Coupons]
 *     summary: Update coupon details (admin)
 *     security: [{ bearerAuth: [] }]
 */
couponsRouter.patch(
  "/:id",
  validateParams(couponIdParamSchema),
  validateBody(updateCouponSchema),
  couponController.update,
);

/**
 * @swagger
 * /coupons/{id}:
 *   delete:
 *     tags: [Coupons]
 *     summary: Delete coupon (admin)
 *     security: [{ bearerAuth: [] }]
 */
couponsRouter.delete("/:id", validateParams(couponIdParamSchema), couponController.remove);
