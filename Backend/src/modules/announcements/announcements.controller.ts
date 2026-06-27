import { Response, NextFunction } from "express";
import { announcementService } from "./announcements.service.js";
import { ApiResponse } from "../../common/api-response.js";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

export const announcementController = {
  async listActive(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await announcementService.listActive());
    } catch (err) {
      next(err);
    }
  },

  async list(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await announcementService.listAll());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await announcementService.getById(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.created(res, await announcementService.create(req.body));
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      ApiResponse.success(res, await announcementService.update(Number(req.params.id), req.body));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await announcementService.remove(Number(req.params.id));
      ApiResponse.message(res, "Announcement deleted");
    } catch (err) {
      next(err);
    }
  },
};
