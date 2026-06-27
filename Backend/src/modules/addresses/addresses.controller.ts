import { Response, NextFunction } from "express";
import { addressService } from "./addresses.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const addressController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await addressService.listForUser(req.user!.userId);
      ApiResponse.success(res, addresses);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.getById(
        req.user!.userId,
        Number(req.params.id),
      );
      ApiResponse.success(res, address);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.create(req.user!.userId, req.body);
      ApiResponse.created(res, address);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const address = await addressService.update(
        req.user!.userId,
        Number(req.params.id),
        req.body,
      );
      ApiResponse.success(res, address);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await addressService.delete(req.user!.userId, Number(req.params.id));
      ApiResponse.message(res, "Address deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
