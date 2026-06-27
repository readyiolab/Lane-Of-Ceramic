import { Response, NextFunction } from "express";
import { siteContentService } from "./site-content.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const siteContentController = {
  async getByKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await siteContentService.getByKey(req.params.key as string));
    } catch (err) {
      next(err);
    }
  },

  async list(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await siteContentService.listAll());
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      ApiResponse.success(res, await siteContentService.upsert(key, value));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await siteContentService.remove(req.params.key as string);
      ApiResponse.message(res, "Content deleted");
    } catch (err) {
      next(err);
    }
  },
};
