import { Response, NextFunction } from "express";
import { discountTierService } from "./discount-tiers.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const discountTierController = {
  async listActive(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await discountTierService.listActive());
    } catch (err) {
      next(err);
    }
  },

  async list(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await discountTierService.listAll());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await discountTierService.getById(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.created(res, await discountTierService.create(req.body));
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await discountTierService.update(Number(req.params.id), req.body));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await discountTierService.remove(Number(req.params.id));
      ApiResponse.message(res, "Discount tier deleted");
    } catch (err) {
      next(err);
    }
  },
};
