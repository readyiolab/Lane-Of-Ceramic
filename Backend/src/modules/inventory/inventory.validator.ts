import { z } from "zod";

export const adjustStockSchema = z.object({
  quantity: z.coerce.number().int(),
  reason: z.string().min(2).max(255),
  variantId: z.coerce.number().int().positive().optional().nullable(),
});

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

export const inventoryLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  productId: z.coerce.number().int().positive().optional(),
});
