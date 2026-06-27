import { Router } from "express";
import { paymentController } from "./payments.controller.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { authGuard } from "../../middlewares/auth.middleware.js";
import { paymentRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import { initiatePaymentSchema, verifyPaymentSchema } from "./payments.validator.js";

export const paymentsRouter = Router();

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a payment session (secured)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cashfree payment session details }
 */
paymentsRouter.post(
  "/initiate",
  authGuard,
  paymentRateLimiter,
  validateBody(initiatePaymentSchema),
  paymentController.initiate,
);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify payment status (secured)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Verification result }
 */
paymentsRouter.post(
  "/verify",
  authGuard,
  paymentRateLimiter,
  validateBody(verifyPaymentSchema),
  paymentController.verify,
);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Cashfree payment webhook notification
 *     responses:
 *       200: { description: Webhook recorded }
 */
paymentsRouter.post("/webhook", paymentController.webhook);
