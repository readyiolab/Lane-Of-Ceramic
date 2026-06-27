import { Request, Response, NextFunction } from "express";
import { productService } from "./products.service.js";
import { ApiResponse } from "../../common/api-response.js";

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.list(req.query as any);
      ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getBySlug(req.params.slug as string);
      ApiResponse.success(res, product);
    } catch (err) {
      next(err);
    }
  },

  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 8;
      const products = await productService.getFeatured(limit);
      ApiResponse.success(res, products);
    } catch (err) {
      next(err);
    }
  },

  async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 8;
      const products = await productService.getTrending(limit);
      ApiResponse.success(res, products);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      ApiResponse.created(res, product);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(Number(req.params.id), req.body);
      ApiResponse.success(res, product);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(Number(req.params.id));
      ApiResponse.message(res, "Product deleted");
    } catch (err) {
      next(err);
    }
  },

  async addImage(req: Request, res: Response, next: NextFunction) {
    try {
      const image = await productService.addImage(Number(req.params.id), req.body);
      ApiResponse.created(res, image);
    } catch (err) {
      next(err);
    }
  },

  async removeImage(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.removeImage(Number(req.params.id), Number(req.params.imageId));
      ApiResponse.message(res, "Image removed");
    } catch (err) {
      next(err);
    }
  },

  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const variant = await productService.addVariant(Number(req.params.id), req.body);
      ApiResponse.created(res, variant);
    } catch (err) {
      next(err);
    }
  },

  async removeVariant(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.removeVariant(Number(req.params.id), Number(req.params.variantId));
      ApiResponse.message(res, "Variant removed");
    } catch (err) {
      next(err);
    }
  },
};
