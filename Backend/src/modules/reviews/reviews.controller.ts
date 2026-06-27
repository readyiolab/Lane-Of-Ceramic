import { Request, Response, NextFunction } from "express";
import { reviewService } from "./reviews.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const reviewController = {
  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.submitReview(req.user!.userId, req.body);
      ApiResponse.created(res, review);
    } catch (err) {
      next(err);
    }
  },

  async listForProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reviewService.listForProduct(
        req.params.slug as string,
        req.query as any,
      );
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
      const isApproved =
        req.query.isApproved === "true"
          ? true
          : req.query.isApproved === "false"
          ? false
          : undefined;

      const result = await reviewService.listAll(page, limit, isApproved);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },

  async adminApprove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await reviewService.approveReview(Number(req.params.id));
      ApiResponse.message(res, "Review approved successfully");
    } catch (err) {
      next(err);
    }
  },

  async adminRemove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await reviewService.deleteReview(Number(req.params.id));
      ApiResponse.message(res, "Review deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
