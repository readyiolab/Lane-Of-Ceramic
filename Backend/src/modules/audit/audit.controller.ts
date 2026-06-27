import { Response, NextFunction } from "express";
import { auditService } from "../../services/audit.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const auditController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await auditService.list(page, limit);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },
};
