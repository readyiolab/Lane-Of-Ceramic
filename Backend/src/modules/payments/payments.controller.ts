import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payments.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const paymentController = {
  async initiate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.createSession(
        req.user!.userId,
        Number(req.body.orderId),
      );
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.verifyPayment(
        req.user!.userId,
        Number(req.body.orderId),
        req.body.providerOrderId,
      );
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["x-cf-signature"] as string;
      await paymentService.processWebhook(req.body, signature);
      ApiResponse.message(res, "Webhook processed");
    } catch (err) {
      next(err);
    }
  },
};
