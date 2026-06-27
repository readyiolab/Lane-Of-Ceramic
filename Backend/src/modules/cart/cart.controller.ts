import { Response, NextFunction } from "express";
import { cartService } from "./cart.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const cartController = {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || null;
      const guestToken = (req.query.guestToken as string) || null;

      const summary = await cartService.getCartSummary(userId, guestToken);
      ApiResponse.success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || null;
      const summary = await cartService.addItem(userId, req.body);
      ApiResponse.success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || null;
      const guestToken = req.body.guestToken || null;
      const itemId = Number(req.params.itemId);

      const summary = await cartService.updateItem(
        userId,
        itemId,
        req.body.quantity,
        guestToken,
      );
      ApiResponse.success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || null;
      const guestToken = (req.query.guestToken as string) || null;
      const itemId = Number(req.params.itemId);

      const summary = await cartService.removeItem(userId, itemId, guestToken);
      ApiResponse.success(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async mergeCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const guestToken = req.body.guestToken;
      if (!guestToken) {
        return ApiResponse.message(res, "No guest token provided");
      }
      await cartService.mergeCart(userId, guestToken);
      const summary = await cartService.getCartSummary(userId, null);
      ApiResponse.success(res, summary);
    } catch (err) {
      next(err);
    }
  },
};
