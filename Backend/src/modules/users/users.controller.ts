import { Response, NextFunction } from "express";
import { userService } from "./users.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.userId);
      ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.userId, req.body);
      ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async deleteProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.user!.userId);
      ApiResponse.message(res, "Account deactivated and scheduled for deletion");
    } catch (err) {
      next(err);
    }
  },

  // ── Admin Handlers ──────────────────────────────────────────

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await userService.listAll(page, limit);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },

  async adminUpdate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.adminUpdate(req.params.id as string, req.body);
      ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  },

  async adminDelete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.params.id as string);
      ApiResponse.message(res, "User deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
