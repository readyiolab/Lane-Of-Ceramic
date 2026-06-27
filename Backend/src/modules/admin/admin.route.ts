import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";

export const adminRouter = Router();

// Secure all admin dashboard routes
adminRouter.use(authGuard, requireAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Retrieve dashboard statistics and metrics (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Object containing stats, low stock products, revenue, sales charts }
 */
adminRouter.get("/dashboard", adminController.getStats);
