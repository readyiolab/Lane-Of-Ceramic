import { Router } from "express";
import { wishlistController } from "./wishlist.controller.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { authGuard } from "../../middlewares/auth.middleware.js";
import { toggleWishlistSchema } from "./wishlist.validator.js";

export const wishlistRouter = Router();

// Secure all wishlist routes
wishlistRouter.use(authGuard);

/**
 * @swagger
 * /wishlist:
 *   get:
 *     tags: [Wishlist]
 *     summary: Retrieve wishlist items of authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of wishlist items }
 */
wishlistRouter.get("/", wishlistController.get);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     tags: [Wishlist]
 *     summary: Toggle product inside user wishlist
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Toggle result }
 */
wishlistRouter.post("/", validateBody(toggleWishlistSchema), wishlistController.toggle);
