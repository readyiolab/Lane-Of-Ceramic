import { Router } from "express";
import { categoryController } from "./categories.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import { createCategorySchema, updateCategorySchema, categoryIdParamSchema, categorySlugParamSchema } from "./categories.validator.js";

export const categoriesRouter = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories flat list
 *     responses:
 *       200: { description: Flat list of categories }
 */
categoriesRouter.get("/", categoryController.list);

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     tags: [Categories]
 *     summary: Get categories as a nested tree
 *     responses:
 *       200: { description: Tree structure of categories }
 */
categoriesRouter.get("/tree", categoryController.tree);

categoriesRouter.get("/slug/:slug/page", validateParams(categorySlugParamSchema), categoryController.getPageBySlug);

categoriesRouter.get("/:id", validateParams(categoryIdParamSchema), categoryController.getById);

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Category created }
 */
categoriesRouter.post(
  "/",
  authGuard,
  requireAdmin,
  validateBody(createCategorySchema),
  categoryController.create,
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update a category (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category updated }
 */
categoriesRouter.patch(
  "/:id",
  authGuard,
  requireAdmin,
  validateParams(categoryIdParamSchema),
  validateBody(updateCategorySchema),
  categoryController.update,
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category deleted }
 */
categoriesRouter.delete(
  "/:id",
  authGuard,
  requireAdmin,
  validateParams(categoryIdParamSchema),
  categoryController.remove,
);
