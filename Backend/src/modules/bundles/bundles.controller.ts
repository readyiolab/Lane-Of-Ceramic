import { Response, NextFunction } from "express";
import { bundleService } from "./bundles.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const bundleController = {
  async listActive(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bundles = await bundleService.listActive();
      ApiResponse.success(res, bundles);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bundles = await bundleService.listAll();
      ApiResponse.success(res, bundles);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bundle = await bundleService.getById(Number(req.params.id));
      ApiResponse.success(res, bundle);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bundle = await bundleService.create(req.body);
      ApiResponse.created(res, bundle);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bundle = await bundleService.update(Number(req.params.id), req.body);
      ApiResponse.success(res, bundle);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bundleService.remove(Number(req.params.id));
      ApiResponse.message(res, "Bundle deleted");
    } catch (err) {
      next(err);
    }
  },
};
