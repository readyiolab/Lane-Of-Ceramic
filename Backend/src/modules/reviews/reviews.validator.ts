import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(150).optional().nullable(),
  comment: z.string().max(1000).optional().nullable(),
});

export const listProductReviewsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
});

export const reviewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const productSlugParamSchemaForReviews = z.object({
  slug: z.string().min(1),
});
