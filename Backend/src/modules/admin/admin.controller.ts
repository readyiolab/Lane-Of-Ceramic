import { Response, NextFunction } from "express";
import { adminService } from "./admin.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const adminController = {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      ApiResponse.success(res, stats);
    } catch (err) {
      next(err);
    }
  },
};
