import { Response, NextFunction } from "express";
import { wishlistService } from "./wishlist.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const wishlistController = {
  async get(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await wishlistService.list(req.user!.userId);
      ApiResponse.success(res, items);
    } catch (err) {
      next(err);
    }
  },

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await wishlistService.toggle(
        req.user!.userId,
        Number(req.body.productId),
      );
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },
};
