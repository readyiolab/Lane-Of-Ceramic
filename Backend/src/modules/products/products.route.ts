import { Router } from "express";
import { productController } from "./products.controller.js";
import { validateQuery, validateParams, validateBody } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import {
  productListQuerySchema,
  productSlugParamSchema,
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
  productImageSchema,
  productVariantSchema,
  imageIdParamSchema,
  variantIdParamSchema,
} from "./products.validator.js";

export const productsRouter = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Retrieve a list of products with filters, sorting and pagination
 *     parameters:
 *       - name: page
 *         in: query
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - name: limit
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - name: sort
 *         in: query
 *         schema: { type: string, enum: [featured, price-asc, price-desc, rating, name-asc, name-desc, newest] }
 *       - name: category
 *         in: query
 *         schema: { type: string }
 *       - name: brand
 *         in: query
 *         schema: { type: string }
 *       - name: q
 *         in: query
 *         schema: { type: string }
 *       - name: minPrice
 *         in: query
 *         schema: { type: number }
 *       - name: maxPrice
 *         in: query
 *         schema: { type: number }
 *       - name: inStock
 *         in: query
 *         schema: { type: string, enum: [true, false] }
 *       - name: onSale
 *         in: query
 *         schema: { type: string, enum: [true, false] }
 *       - name: tag
 *         in: query
 *         schema: { type: string }
 *       - name: rating
 *         in: query
 *         schema: { type: number, minimum: 1, maximum: 5 }
 *     responses:
 *       200: { description: List of products }
 */
productsRouter.get("/", validateQuery(productListQuerySchema), productController.list);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     tags: [Products]
 *     summary: Retrieve featured products
 *     responses:
 *       200: { description: Featured products list }
 */
productsRouter.get("/featured", productController.getFeatured);

/**
 * @swagger
 * /products/trending:
 *   get:
 *     tags: [Products]
 *     summary: Retrieve trending products
 *     responses:
 *       200: { description: Trending products list }
 */
productsRouter.get("/trending", productController.getTrending);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Retrieve a single product by its slug
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Detailed product object }
 *       404: { description: Product not found }
 */
productsRouter.get("/:slug", validateParams(productSlugParamSchema), productController.getBySlug);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Admin create a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Product created }
 */
productsRouter.post(
  "/",
  authGuard,
  requireAdmin,
  validateBody(createProductSchema),
  productController.create,
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Admin update a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product updated }
 */
productsRouter.patch(
  "/:id",
  authGuard,
  requireAdmin,
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  productController.update,
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Admin soft delete a product
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product deleted }
 */
productsRouter.delete(
  "/:id",
  authGuard,
  requireAdmin,
  validateParams(productIdParamSchema),
  productController.remove,
);

productsRouter.post(
  "/:id/images",
  authGuard,
  requireAdmin,
  validateParams(productIdParamSchema),
  validateBody(productImageSchema),
  productController.addImage,
);

productsRouter.delete(
  "/:id/images/:imageId",
  authGuard,
  requireAdmin,
  validateParams(imageIdParamSchema),
  productController.removeImage,
);

productsRouter.post(
  "/:id/variants",
  authGuard,
  requireAdmin,
  validateParams(productIdParamSchema),
  validateBody(productVariantSchema),
  productController.addVariant,
);

productsRouter.delete(
  "/:id/variants/:variantId",
  authGuard,
  requireAdmin,
  validateParams(variantIdParamSchema),
  productController.removeVariant,
);
