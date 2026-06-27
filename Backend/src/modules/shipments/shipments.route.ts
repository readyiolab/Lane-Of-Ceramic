import { Router } from "express";
import { shipmentController } from "./shipments.controller.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { authGuard, requireAdmin } from "../../middlewares/auth.middleware.js";
import { bookShipmentSchema, bookAwbSchema } from "./shipments.validator.js";

export const shipmentsRouter = Router();

/**
 * @swagger
 * /shipments/book:
 *   post:
 *     tags: [Shipments]
 *     summary: Book a shipment for a paid order (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Shipment order created }
 */
shipmentsRouter.post(
  "/book",
  authGuard,
  requireAdmin,
  validateBody(bookShipmentSchema),
  shipmentController.book,
);

/**
 * @swagger
 * /shipments/book-awb:
 *   post:
 *     tags: [Shipments]
 *     summary: Assign AWB code and request courier pickup (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: AWB assigned and booked }
 */
shipmentsRouter.post(
  "/book-awb",
  authGuard,
  requireAdmin,
  validateBody(bookAwbSchema),
  shipmentController.bookAwb,
);

/**
 * @swagger
 * /shipments/webhook:
 *   post:
 *     tags: [Shipments]
 *     summary: Shiprocket shipment status change webhook
 *     responses:
 *       200: { description: Webhook processed }
 */
shipmentsRouter.post("/webhook", shipmentController.webhook);
