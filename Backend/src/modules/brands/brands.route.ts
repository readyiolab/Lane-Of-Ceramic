import { Router } from "express";
import { brandController } from "./brands.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import { createBrandSchema, updateBrandSchema, brandIdParamSchema } from "./brands.validator.js";

export const brandsRouter = Router();

/**
 * @swagger
 * /brands:
 *   get:
 *     tags: [Brands]
 *     summary: Get all brands flat list
 *     responses:
 *       200: { description: List of brands }
 */
brandsRouter.get("/", brandController.list);

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand by id
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Brand object }
 */
brandsRouter.get("/:id", validateParams(brandIdParamSchema), brandController.getById);

/**
 * @swagger
 * /brands:
 *   post:
 *     tags: [Brands]
 *     summary: Create a brand (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Brand created }
 */
brandsRouter.post(
  "/",
  authGuard,
  requireAdmin,
  validateBody(createBrandSchema),
  brandController.create,
);

/**
 * @swagger
 * /brands/{id}:
 *   patch:
 *     tags: [Brands]
 *     summary: Update a brand (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Brand updated }
 */
brandsRouter.patch(
  "/:id",
  authGuard,
  requireAdmin,
  validateParams(brandIdParamSchema),
  validateBody(updateBrandSchema),
  brandController.update,
);

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     tags: [Brands]
 *     summary: Delete a brand (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Brand deleted }
 */
brandsRouter.delete(
  "/:id",
  authGuard,
  requireAdmin,
  validateParams(brandIdParamSchema),
  brandController.remove,
);
