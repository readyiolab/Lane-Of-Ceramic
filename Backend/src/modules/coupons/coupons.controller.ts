import { Request, Response, NextFunction } from "express";
import { couponService } from "./coupons.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const couponController = {
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await couponService.checkCoupon(
        req.query.code as string,
        Number(req.query.subtotal),
      );
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },

  // ── Admin Handlers ──────────────────────────────────────────

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await couponService.listAll();
      ApiResponse.success(res, coupons);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.getById(Number(req.params.id));
      ApiResponse.success(res, coupon);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.create(req.body);
      ApiResponse.created(res, coupon);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await couponService.update(Number(req.params.id), req.body);
      ApiResponse.success(res, coupon);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await couponService.delete(Number(req.params.id));
      ApiResponse.message(res, "Coupon deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
