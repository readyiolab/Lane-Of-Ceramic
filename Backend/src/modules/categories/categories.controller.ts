import { Request, Response, NextFunction } from "express";
import { categoryService } from "./categories.service.js";
import { ApiResponse } from "../../common/api-response.js";

export const categoryController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listAll();
      ApiResponse.success(res, categories);
    } catch (err) {
      next(err);
    }
  },

  async tree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await categoryService.getTree();
      ApiResponse.success(res, tree);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.getById(Number(req.params.id));
      ApiResponse.success(res, category);
    } catch (err) {
      next(err);
    }
  },

  async getPageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await categoryService.getPageBySlug(req.params.slug as string, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 24,
      });
      ApiResponse.success(res, page);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.create(req.body);
      ApiResponse.created(res, category);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.update(Number(req.params.id), req.body);
      ApiResponse.success(res, category);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(Number(req.params.id));
      ApiResponse.message(res, "Category deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
