import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { validateBody, validateQuery, validateParams } from "../../middlewares/validate.middleware.js";
import { optionalAuth, authGuard } from "../../middlewares/auth.middleware.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  getCartQuerySchema,
  cartItemIdParamSchema,
} from "./cart.validator.js";

export const cartRouter = Router();

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get cart contents
 *     parameters:
 *       - name: guestToken
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200: { description: Cart summary }
 */
cartRouter.get(
  "/",
  optionalAuth,
  validateQuery(getCartQuerySchema),
  cartController.getCart,
);

/**
 * @swagger
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     responses:
 *       200: { description: Cart summary }
 */
cartRouter.post(
  "/",
  optionalAuth,
  validateBody(addToCartSchema),
  cartController.addItem,
);

/**
 * @swagger
 * /cart/{itemId}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     responses:
 *       200: { description: Cart summary }
 */
cartRouter.patch(
  "/:itemId",
  optionalAuth,
  validateParams(cartItemIdParamSchema),
  validateBody(updateCartItemSchema),
  cartController.updateItem,
);

/**
 * @swagger
 * /cart/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     responses:
 *       200: { description: Cart summary }
 */
cartRouter.delete(
  "/:itemId",
  optionalAuth,
  validateParams(cartItemIdParamSchema),
  validateQuery(getCartQuerySchema),
  cartController.removeItem,
);

/**
 * @swagger
 * /cart/merge:
 *   post:
 *     tags: [Cart]
 *     summary: Merge guest cart into user cart
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Merged cart summary }
 */
cartRouter.post(
  "/merge",
  authGuard,
  cartController.mergeCart,
);
