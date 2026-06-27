import { Response, NextFunction } from "express";
import { uploadService } from "./upload.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { AppError } from "../../common/api-error.js";

export const uploadController = {
  async uploadImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!(req as any).file) throw AppError.badRequest("No file uploaded");
      const folder = (req.body.folder as string) || "products";
      const result = await uploadService.uploadToCloudinary((req as any).file, folder);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  },
};
