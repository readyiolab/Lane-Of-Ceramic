import { Router } from "express";
import { userController } from "./users.controller.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import { updateProfileSchema, adminUpdateUserSchema, userIdParamSchema } from "./users.validator.js";

export const usersRouter = Router();

// Apply authGuard to all user routes
usersRouter.use(authGuard);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Retrieve currently authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile object }
 */
usersRouter.get("/profile", userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Update currently authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated profile object }
 */
usersRouter.patch("/profile", validateBody(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /users/profile:
 *   delete:
 *     tags: [Users]
 *     summary: Deactivate and delete own account
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Account deleted }
 */
usersRouter.delete("/profile", userController.deleteProfile);

// ── Admin Routes ──────────────────────────────────────────────

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get paginated list of all users (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated list }
 */
usersRouter.get("/", requireAdmin, userController.list);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user details like roles/status (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated user object }
 */
usersRouter.patch(
  "/:id",
  requireAdmin,
  validateParams(userIdParamSchema),
  validateBody(adminUpdateUserSchema),
  userController.adminUpdate,
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user account (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Account deleted }
 */
usersRouter.delete(
  "/:id",
  requireAdmin,
  validateParams(userIdParamSchema),
  userController.adminDelete,
);
