import { Request, Response, NextFunction } from "express";
import { brandService } from "./brands.service.js";
import { ApiResponse } from "../../common/api-response.js";

export const brandController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await brandService.listAll();
      ApiResponse.success(res, brands);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.getById(Number(req.params.id));
      ApiResponse.success(res, brand);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.create(req.body);
      ApiResponse.created(res, brand);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await brandService.update(Number(req.params.id), req.body);
      ApiResponse.success(res, brand);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await brandService.delete(Number(req.params.id));
      ApiResponse.message(res, "Brand deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
