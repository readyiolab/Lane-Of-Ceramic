import { Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const inventoryController = {
  async adjustStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.adjustStock(
        Number(req.params.productId),
        req.body.quantity,
        req.body.reason,
        req.body.variantId,
      );
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async listLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.listLogs({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        productId: req.query.productId ? Number(req.query.productId) : undefined,
      });
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },
};
