import { Response, NextFunction } from "express";
import { orderService } from "./orders.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import type { OrderStatusType } from "../../config/constants.js";

export const orderController = {
  async place(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await orderService.placeOrder(req.user!.userId, req.body);
      ApiResponse.created(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderDetail(
        req.user!.userId,
        Number(req.params.id),
      );
      ApiResponse.success(res, order);
    } catch (err) {
      next(err);
    }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await orderService.listUserOrders(req.user!.userId, req.query);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },

  // ── Admin Handlers ──────────────────────────────────────────

  async adminList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const status = req.query.status as string;

      const result = await orderService.listAll(page, limit, status);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },

  async adminGetById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getAdminOrderDetail(Number(req.params.id));
      ApiResponse.success(res, order);
    } catch (err) {
      next(err);
    }
  },

  async adminUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.updateStatus(
        Number(req.params.id),
        req.body.status,
      );
      ApiResponse.success(res, { id: Number(order!.id), status: order!.status });
    } catch (err) {
      next(err);
    }
  },
};
