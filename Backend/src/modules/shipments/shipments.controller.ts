import { Request, Response, NextFunction } from "express";
import { shipmentService } from "./shipments.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const shipmentController = {
  async book(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await shipmentService.createShipment(Number(req.body.orderId));
      ApiResponse.created(res, result);
    } catch (err) {
      next(err);
    }
  },

  async bookAwb(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await shipmentService.assignAwbAndBook(
        Number(req.body.shipmentId),
        Number(req.body.courierId || 1), // default courier ID
      );
      ApiResponse.message(res, "AWB assigned and pickup requested");
    } catch (err) {
      next(err);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      await shipmentService.processWebhook(req.body);
      ApiResponse.message(res, "Webhook processed");
    } catch (err) {
      next(err);
    }
  },
};
